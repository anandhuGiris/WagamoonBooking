import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import VillaRoundedIcon from '@mui/icons-material/VillaRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../../api/propertyApi';
import { DashboardStats, Property, PropertyStatus } from '../../types/Property';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (err: any) {
      setError('Could not connect to the backend API.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: PropertyStatus) => {
    switch (status) {
      case 'Active':
        return (
          <Chip
            label="Active"
            size="small"
            sx={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 700 }}
          />
        );
      case 'Draft':
        return (
          <Chip
            label="Draft"
            size="small"
            sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 700 }}
          />
        );
      case 'Inactive':
      default:
        return (
          <Chip
            label="Inactive"
            size="small"
            sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700 }}
          />
        );
    }
  };

  if (loading) {
    return <LoadingState message="Loading dashboard metrics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStats} />;
  }

  const kpis = [
    {
      title: 'Total Properties',
      count: stats?.totalProperties || 0,
      icon: <VillaRoundedIcon sx={{ fontSize: 30, color: '#0d9488' }} />,
      bgColor: '#ccfbf1',
      subtitle: 'Managed across single location',
    },
    {
      title: 'Active Properties',
      count: stats?.activeProperties || 0,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 30, color: '#10b981' }} />,
      bgColor: '#d1fae5',
      subtitle: 'Visible on Public Website',
      highlight: true,
    },
    {
      title: 'Draft Properties',
      count: stats?.draftProperties || 0,
      icon: <EditNoteRoundedIcon sx={{ fontSize: 30, color: '#f59e0b' }} />,
      bgColor: '#fef3c7',
      subtitle: 'Under preparation / unpublished',
    },
    {
      title: 'Inactive Properties',
      count: stats?.inactiveProperties || 0,
      icon: <PauseCircleFilledRoundedIcon sx={{ fontSize: 30, color: '#64748b' }} />,
      bgColor: '#f1f5f9',
      subtitle: 'Hidden from public enquiry',
    },
  ];

  return (
    <Box>
      {/* Page Title & CTAs */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Overview Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wagamon resort listings, publication statuses, and public API metrics.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LaunchRoundedIcon />}
            component="a"
            href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://wagamoonbooking.com'}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 700 }}
          >
            View Public Site
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => navigate('/properties/new')}
            sx={{ fontWeight: 700 }}
          >
            + Add Property
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.title}>
            <Card
              sx={{
                p: 1,
                border: kpi.highlight ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: '#0f172a' }}>
                      {kpi.count}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      backgroundColor: kpi.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {kpi.icon}
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Properties Section */}
      <Card sx={{ borderRadius: 3 }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Recent Properties
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest properties created or updated in Wagamon.
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/properties')}
            sx={{ fontWeight: 700, color: '#0d9488' }}
          >
            View All Properties
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats?.recentProperties && stats.recentProperties.length > 0 ? (
                stats.recentProperties.map((prop) => (
                  <TableRow key={prop.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {prop.primaryImageUrl ? (
                          <Box
                            component="img"
                            src={prop.primaryImageUrl}
                            alt={prop.name}
                            sx={{ width: 44, height: 44, borderRadius: 2, objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              bgcolor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8',
                            }}
                          >
                            <VillaRoundedIcon fontSize="small" />
                          </Box>
                        )}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              cursor: 'pointer',
                              '&:hover': { color: '#0d9488' },
                            }}
                            onClick={() => navigate(`/properties/${prop.id}/edit`)}
                          >
                            {prop.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prop.facilityCount} amenities • {prop.imageCount} photos
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{prop.location}</TableCell>
                    <TableCell>{getStatusChip(prop.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {new Date(prop.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Edit Property">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/properties/${prop.id}/edit`)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No properties found. Click &quot;+ Add Property&quot; to create your first listing.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
