// @flow
type Options<E> = {
    actionTypes?: Array<string>,
    revive?: (entity: any) => E,
    merger?: (a: E, b: E) => E,
};
export type Map<E> = { [string | number]: E };
type Action = {
    type: string,
    payload: {
        entities: { [string]: Map<*> },
    },
};
export type Reducer<E> = (state: Map<E>, action: Action) => Map<E>;
const entityReducer = <E>(reducer: Reducer<E>, options: Options<E> = {}) => (
    name: string,
): Reducer<E> => {
    const {
        actionTypes = [],
        revive = entity => entity,
        // By default, replace the entity from the state with the one from the action's payload
        merger = (stateEntity, payloadEntity) => payloadEntity,
    } = options;

    // The name is required since it is used to find the entities in the payload
    if (typeof name !== 'string') {
        throw new Error('The higher order reducer should be passed a string for name');
    }

    return (state: Map<E> = {}, action: Action): Map<E> => {
        let updatedState = state;

        // Handle the merge of the received entities and the current state
        if (actionTypes.includes(action.type)) {
            const entities = action.payload.entities[name];

            if (entities) {
                updatedState = Object.keys(entities).reduce(
                    (mergedState: Map<E>, entityId) => ({
                        ...mergedState,
                        // If the entity is already in the state, use the merger function
                        [entityId]: mergedState[entityId]
                            ? merger(mergedState[entityId], revive(entities[entityId]), action)
                            : revive(entities[entityId]),
                    }),
                    state,
                );
            }
        }

        return reducer(updatedState, action);
    };
};

export default entityReducer;
