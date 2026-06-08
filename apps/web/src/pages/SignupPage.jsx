
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, passwordConfirm, name);
      toast.success('Account created successfully');
      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - AKSHA</title>
        <meta name="description" content="Create your AKSHA account and start discovering your unique purpose." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
            <CardDescription className="text-muted-foreground">Start your journey to discover your unique purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="text-foreground bg-background border-border focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="text-foreground bg-background border-border focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    className="text-foreground bg-background border-border focus-visible:ring-primary pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    className="text-foreground bg-background border-border focus-visible:ring-primary pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SignupPage;
