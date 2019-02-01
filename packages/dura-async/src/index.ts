import { RootModel, Model, Plugin, DuraStore } from "@dura/types";
import { createAction } from "redux-actions";

/**
 * 提取effects
 * @param name
 * @param model
 */
function extractEffects(name: string, model: Model) {
  const effects = model.effects || {};
  const effectKeys = Object.keys(effects);
  const nextEffects = effectKeys
    .map((effectName: string) => ({ [`${name}/${effectName}`]: effects[effectName] }))
    .reduce((prev, next) => ({ ...prev, ...next }), {});
  return nextEffects;
}

//创建单个model 的action runner
function createModelEffectRunner(name: string, model: Model, dispatch) {
  const { effects = {} } = model;
  const effectKeys = Object.keys(effects);
  const merge = (prev, next) => ({ ...prev, ...next });

  const createActionMap = (key: string) => ({
    [key]: (payload: any, meta: any) =>
      dispatch(createAction(`${name}/${key}`, payload => payload, (payload, meta) => meta)(payload, meta))
  });

  const action = effectKeys.map(createActionMap).reduce(merge, {});
  return { [name]: action };
}

//创建全局的action  runner
function createEffectRunner(models: RootModel, dispatch) {
  const merge = (prev, next) => ({ ...prev, ...next });
  return Object.keys(models)
    .map((name: string) => createModelEffectRunner(name, models[name], dispatch))
    .reduce(merge, {});
}

export const createAsyncPlugin = function(rootModel: RootModel): Plugin {
  //聚合effects
  const rootEffects = Object.keys(rootModel)
    .map((name: string) => extractEffects(name, rootModel[name]))
    .reduce((prev, next) => ({ ...prev, ...next }), {});
  const delay = (ms: number) => new Promise(resolve => setTimeout(() => resolve(), ms));
  return {
    name: "asyncPlugin",
    middleware(store) {
      return next => async action => {
        let result = next(action);
        if (typeof rootEffects[action.type] === "function") {
          const dispatch = store.dispatch;
          const getState = () => store.getState();
          //执行effect
          const effect = rootEffects[action.type](action.payload, action.meta);
          result = await effect({
            dispatch,
            getState,
            delay
          });
        }
        return result;
      };
    },
    onStoreCreated(store: DuraStore & AsyncDuraStore) {
      store.effectRunner = createEffectRunner(rootModel, store.dispatch);
    }
  };
};

export type ExtractEffectsRunner<M extends RootModel> = { [key in keyof M]: M[key]["effects"] };

export type AsyncDuraStore<M extends RootModel = any> = {
  effectRunner: ExtractEffectsRunner<M>;
};
