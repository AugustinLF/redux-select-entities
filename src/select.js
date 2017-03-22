// @flow
import curry from 'lodash.curry';

import type { Map } from './entityReducer';

type EntityState = {
    [string]: Map<*>,
};
type EntityGetter = (state: Object) => EntityState;

const getEntities: EntityGetter = state => state.entities;

const customSelectAll = (selectEntities: EntityGetter) =>
    curry((entityName: string, state: Object) => {
        const entityState = selectEntities(state)[entityName];
        if (typeof entityState !== 'object') {
            throw new Error(
                `The getter creator received a state that did not include ${entityName} entities`,
            );
        }

        return entityState;
    });
const selectAll = customSelectAll(getEntities);

const customSelect = (selectEntities: EntityGetter) =>
    curry((entityName: string, state: Object, elementId: string | number): Object | null => {
        const entityState = customSelectAll(selectEntities)(entityName, state);

        return entityState[String(elementId)] || null;
    });
const select = customSelect(getEntities);

export { select, customSelect, selectAll, customSelectAll };
