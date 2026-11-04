import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { userApi } from '../../api/userApi';

export const AddAdminPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('Admin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter the administrator full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await userApi.createAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (response.success && response.data) {
        navigate('/admins');
      } else {
        setError(response.message || 'Failed to create administrator account.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Server error while creating administrator.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLengthValid = password.length >= 6;
  const isMatchValid = Boolean(password && confirmPassword && password === confirmPassword);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 860, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admins')}
          sx={{ borderColor: '#cbd5e1', mb: 2, textTransform: 'none', borderRadius: 2 }}
        >
          Back to Administrators
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              backgroundColor: 'rgba(15, 118, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonAddAlt1RoundedIcon sx={{ color: '#0f766e', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Add New Administrator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Provision an administrative account with credentials to access the management portal.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Form Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  Account Identity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter the administrator full legal or display name and primary corporate email.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  placeholder="rahul@wagamoonbooking.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  helperText="Used as the login username."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  Security & Access Role
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set a secure password and select access permissions.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Confirm Password *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Password Requirements Guidance */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    PASSWORD REQUIREMENTS:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 16, color: isLengthValid ? '#16a34a' : '#94a3b8' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: isLengthValid ? '#16a34a' : '#64748b', fontWeight: isLengthValid ? 600 : 400 }}
                    >
                      Must contain at least 6 characters
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 16, color: isMatchValid ? '#16a34a' : '#94a3b8' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: isMatchValid ? '#16a34a' : '#64748b', fontWeight: isMatchValid ? 600 : 400 }}
                    >
                      Passwords must match
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="admin-role-label">Administrative Role</InputLabel>
                  <Select
                    labelId="admin-role-label"
                    value={role}
                    label="Administrative Role"
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="Admin">Admin (Full Access)</MenuItem>
                    <MenuItem value="SuperAdmin">SuperAdmin (System Owner)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(15, 118, 110, 0.05)',
                    border: '1px solid rgba(15, 118, 110, 0.2)',
                  }}
                >
                  <ShieldOutlinedIcon sx={{ color: '#0f766e', fontSize: 24, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#0f766e', lineHeight: 1.5 }}>
                    The new administrator will be able to log in immediately at <strong>/login</strong> using the provided email and password.
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/admins')}
                    disabled={isSubmitting}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: '#0f766e',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 4,
                      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                      '&:hover': { backgroundColor: '#0d9488' },
                    }}
                  >
                    {isSubmitting ? 'Creating Administrator...' : 'Create Administrator'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
