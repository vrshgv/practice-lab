import { initialState, modalFormReducer, ActionType } from './modalFormReducer';

describe('modalFormReducer', () => {
  it('sets name correctly', () => {
    const newState = modalFormReducer(initialState, {
      type: ActionType.UPDATE_NAME,
      payload: 'Vera'
    })

    expect(newState.name).toBe('Vera');
  });

  it('sets email correctly', () => {
    const newState = modalFormReducer(initialState, {
      type: ActionType.UPDATE_EMAIL,
      payload: 'vera@example.com'
    })

    expect(newState.email).toBe('vera@example.com');
  });
})
