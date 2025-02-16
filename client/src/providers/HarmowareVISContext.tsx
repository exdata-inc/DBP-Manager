import * as React from 'react';
import { BasedState } from 'harmoware-vis';
import { defaultMapStateToProps } from 'harmoware-vis/lib/src/library';
import { AnyAction, EmptyObject, bindActionCreators } from '@reduxjs/toolkit';
import * as Actions from 'harmoware-vis/lib/src/actions';
import { connect, ReactReduxContextValue } from 'react-redux';

// @ts-ignore
const HarmowareVISContext = React.createContext<ReactReduxContextValue<EmptyObject & { base: BasedState; }, AnyAction>>(null);

export const connectToHarmowareVISContext = (component: any, moreActions = null) => {
    const extendedActions = Object.assign({}, Actions, moreActions);
    function mapDispatchToProps(dispatch: any) {
        return { actions: bindActionCreators(extendedActions, dispatch) };
    }
    return connect(defaultMapStateToProps, mapDispatchToProps, null, { context: HarmowareVISContext })(component);
}

export default HarmowareVISContext;
