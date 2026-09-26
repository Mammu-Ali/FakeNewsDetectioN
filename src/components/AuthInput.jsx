import { forwardRef } from 'react';

const AuthInput = forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <label htmlFor={props.id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div>
        <input
          {...props}
          ref={ref}
          className={`block w-full rounded-lg border py-2 px-3 shadow-sm outline-none transition-colors sm:text-sm ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          }`}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
