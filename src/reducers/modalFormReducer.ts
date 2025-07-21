type FormState = {
  name: string;
  email: string;
  password: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitted: boolean;
}

export enum ActionType {
  UPDATE_NAME = 'UPDATE_NAME',
  UPDATE_EMAIL = 'UPDATE_EMAIL',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  SET_ERRORS = 'SET_ERRORS',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
  SET_SUBMITTED = 'SET_SUBMITTED',
}

type FormAction = {
  type: ActionType.UPDATE_NAME;
  payload: string;
} | {
  type: ActionType.UPDATE_EMAIL;
  payload: string;
} | {
  type: ActionType.UPDATE_PASSWORD;
  payload: string;
} | {
  type: ActionType.SET_ERRORS;
  payload: Record<string, string>;
} | {
  type: ActionType.SET_IS_SUBMITTING;
  payload: boolean;
} | {
  type: ActionType.SET_SUBMITTED;
  payload: boolean;
}

export const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  errors: {},
  isSubmitting: false,
  submitted: false,
}

export function modalFormReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case ActionType.UPDATE_NAME: 
    return {
      ...state,
      name: action.payload
    }
    case ActionType.UPDATE_EMAIL:
      return {
        ...state,
        email: action.payload 
      }
    case ActionType.UPDATE_PASSWORD:
      return {
        ...state,
        password: action.payload
      }
    case ActionType.SET_ERRORS:
      return {
        ...state,
        errors: action.payload
      }
    case ActionType.SET_IS_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.payload
      }
    case ActionType.SET_SUBMITTED:
      return {
        ...state,
        submitted: action.payload
      }
    default:
      return state;
}};
