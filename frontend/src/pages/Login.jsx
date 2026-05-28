import { useMemo, useState } from 'react';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'accounts', label: 'Accounts Officer' },
  { value: 'examiner', label: 'Examiner' },
];

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function Login({ onLogin, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    const map = [
      { label: 'Weak', color: '#ffb4ab' },
      { label: 'Weak', color: '#ffb4ab' },
      { label: 'Fair', color: '#ffb783' },
      { label: 'Fair', color: '#ffb783' },
      { label: 'Strong', color: '#89ceff' },
      { label: 'Very Strong', color: '#89ceff' },
    ];
    return { score, ...map[score] };
  }, [password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRegisterError('');
    if (isRegister) {
      if (!PASSWORD_REGEX.test(password)) {
        setRegisterError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
        return;
      }
      if (password !== confirmPassword) {
        setRegisterError('Passwords do not match.');
        return;
      }
    }
    await onLogin(email, password, isRegister, name, role);
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-10%] animate-pulse fixed rounded-full opacity-15 blur-[80px] -z-10"></div>
      <div className="orb w-[400px] h-[400px] bg-secondary bottom-[-5%] right-[-5%] animate-pulse fixed rounded-full opacity-15 blur-[80px] -z-10" style={{ animationDelay: '2s' }}></div>

      <main className="w-full max-w-[480px] px-margin-mobile md:px-0">
        <div className="text-center mb-8">
          <h1 className="text-primary font-headline-md text-headline-md font-bold tracking-tight mb-2">Exam Clearance System</h1>
          <p className="text-on-surface-variant font-body-md text-body-md">Institutional Academic Gateway</p>
        </div>

        <div className="glass-card rounded-xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex bg-surface-container-low p-1 rounded-lg mb-8 relative">
            <div
              className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-surface-container-high rounded-md transition-all duration-300 left-1 top-1"
              id="toggle-bg"
              style={{ left: isRegister ? 'calc(50% + 0px)' : '4px' }}
            ></div>
            <button
              className={`relative z-10 flex-1 py-2 text-label-md font-label-md transition-colors ${!isRegister ? 'text-on-surface' : 'text-on-surface-variant'}`}
              onClick={() => setIsRegister(false)}
            >
              Sign In
            </button>
            <button
              className={`relative z-10 flex-1 py-2 text-label-md font-label-md transition-colors ${isRegister ? 'text-on-surface' : 'text-on-surface-variant'}`}
              onClick={() => setIsRegister(true)}
            >
              Register
            </button>
          </div>

          <form className={`space-y-6 ${isRegister ? 'hidden' : ''}`} onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder={role !== 'student' && isRegister ? 'email@.com' : 'name@university.edu'}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-12 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="bg-error-container/20 text-error text-label-md rounded-lg px-4 py-3 border border-error/20">{error}</div>}

            <button className="w-full primary-gradient text-on-primary font-label-md text-label-md py-4 rounded-lg font-bold bloom-effect hover:brightness-110 active:scale-[0.98] transition-all" type="submit">
              Sign In to Portal
            </button>
          </form>

          <form className={`space-y-5 ${!isRegister ? 'hidden' : ''}`} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Alex Rivers"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors">University Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder={role !== 'student' ? 'email@.com' : 'a.rivers@edu.pk'}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors">Institutional Role</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roles.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors">Create Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_reset</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-12 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px]" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>
              <div className="group">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1 group-focus-within:text-primary transition-colors">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-12 pr-12 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {(error || registerError) && <div className="bg-error-container/20 text-error text-label-md rounded-lg px-4 py-3 border border-error/20">{registerError || error}</div>}

            <button className="w-full primary-gradient text-on-primary font-label-md text-label-md py-4 rounded-lg font-bold bloom-effect hover:brightness-110 active:scale-[0.98] transition-all mt-4" type="submit">
              Create Account
            </button>
          </form>
        </div>

        <div className="mt-8 flex justify-center items-center space-x-6 opacity-40">
          <div className="h-[1px] w-12 bg-outline"></div>
          <span className="text-label-sm font-label-sm tracking-widest uppercase">Secured by AES-256</span>
          <div className="h-[1px] w-12 bg-outline"></div>
        </div>
      </main>
    </div>
  );
}

export default Login;
