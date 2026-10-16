import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  electricListReducer,
  electricDetailsReducer,
  electricDeleteReducer,
  electricCreateReducer,
  electricUpdateReducer,
  loginReducer,
  electricKWHReducer,
} from "./reducers/electricReducers";

const rootReducer = combineReducers({
  login: loginReducer,
  electricKWH: electricKWHReducer,

  electricList: electricListReducer,
  electricDetails: electricDetailsReducer,
  electricDelete: electricDeleteReducer,
  electricCreate: electricCreateReducer,
  electricUpdate: electricUpdateReducer,
});

const middleware = [thunk];

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
