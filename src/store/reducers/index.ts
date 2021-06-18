import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from './app';
import { balanceReducer } from './balances';

const rootReducer = combineReducers({
	balances: balanceReducer.reducer,
	appConfig: appReducer.reducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
