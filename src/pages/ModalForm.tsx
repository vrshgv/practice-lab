import React, { useState, useRef, useEffect, useReducer } from 'react';
import { initialState, modalFormReducer, ActionType } from '../reducers/modalFormReducer';

export function ModalForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, dispatch] = useReducer(modalFormReducer, initialState);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const validate = () => {
    const newErrors: typeof formState.errors = {};

    if (!formState.name) newErrors.name = 'Name is required';
    if (!formState.email || !formState.email.includes('@')) newErrors.email = 'Invalid email';
    if (!formState.password) newErrors.password = 'Password is required';

    dispatch({type: ActionType.SET_ERRORS, payload: newErrors});
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({type: ActionType.SET_ERRORS, payload: {}})
    
    if (!validate()) return;

    dispatch({type: ActionType.SET_IS_SUBMITTING, payload: true});
    setTimeout(() => {
      dispatch({type: ActionType.SET_IS_SUBMITTING, payload: false});
      dispatch({type: ActionType.SET_SUBMITTED, payload: true});
    }, 2000);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <div ref={modalRef} className="modal-content">
            <h2>Modal</h2>
            { formState.submitted && (
              <p>Form submitted successfully!</p>
            )}
            { formState.isSubmitting && (
              <p>Submitting...</p>
            )}
            { !formState.submitted && !formState.isSubmitting && (
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" value={formState.name} onChange={(e) => dispatch({type: ActionType.UPDATE_NAME, payload: e.target.value})} />
                  {formState.errors.name && <p className="error">{formState.errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={formState.email} onChange={(e) => dispatch({type: ActionType.UPDATE_EMAIL, payload: e.target.value})} />
                {formState.errors.email && <p className="error">{formState.errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={formState.password} onChange={(e) => dispatch({type: ActionType.UPDATE_PASSWORD, payload: e.target.value})} />
                {formState.errors.password && <p className="error">{formState.errors.password}</p>}
              </div>
              <button type="submit">Submit</button>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
