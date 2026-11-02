import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import BathtubOutlinedIcon from '@mui/icons-material/BathtubOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import { propertyApi } from '../../api/propertyApi';
import { PublicProperty } from '../../types/Property';

interface GoDaddyPreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export const GoDaddyPreviewModal: React.FC<GoDaddyPreviewModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (open) {
      loadPublicProperties();
    }
  }, [open]);

  const loadPublicProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyApi.getPublicProperties();
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError('No active properties found.');
      }
    } catch (err: any) {
      setError('Could not connect to public API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const embedScript = `<!-- Wagamoon Booking GoDaddy Custom HTML Block -->
<div id="wagamoon-properties-container"></div>
<script>
  (async function() {
    try {
      const response = await fetch('${apiBaseUrl}/public/properties');
      const data = await response.json();
      if (!data.success || !data.data || data.data.length === 0) {
        document.getElementById('wagamoon-properties-container').innerHTML = '<p style="text-align:center;padding:2rem;">No properties currently available.</p>';
        return;
      }
      
      const cardsHtml = data.data.map(p => {
        const primaryImg = p.images.find(img => img.isPrimary)?.url || (p.images[0]?.url || 'https://via.placeholder.com/600x400?text=No+Image');
        const facilitiesBadges = p.facilities.map(f => '<span style="display:inline-block;background:#f1f5f9;color:#334155;font-size:12px;padding:3px 8px;border-radius:4px;margin-right:6px;margin-bottom:6px;">✓ ' + f + '</span>').join('');
        
        return \`
          <div style="background:#fff;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.08);overflow:hidden;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin-bottom:24px;">
            <div style="height:220px;overflow:hidden;position:relative;">
              <img src="\${primaryImg}" alt="\${p.name}" style="width:100%;height:100%;object-fit:cover;" />
            </div>
            <div style="padding:20px;flex-grow:1;display:flex;flex-direction:column;">
              <h3 style="margin:0 0 6px 0;font-size:20px;color:#0f172a;">\${p.name}</h3>
              <p style="margin:0 0 12px 0;color:#64748b;font-size:14px;">📍 \${p.location}</p>
              <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.5;flex-grow:1;">\${p.description}</p>
              <div style="margin-bottom:16px;">\${facilitiesBadges}</div>
              <a href="\${p.whatsAppUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;background:#25D366;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(37,211,102,0.3);text-align:center;">
                💬 Contact on WhatsApp
              </a>
            </div>
          </div>
        \`;
      }).join('');
      
      document.getElementById('wagamoon-properties-container').innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px;">' + cardsHtml + '</div>';
    } catch (e) {
      document.getElementById('wagamoon-properties-container').innerHTML = '<p style="color:red;text-align:center;">Unable to load properties.</p>';
    }
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            GoDaddy Public Website Integration
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Consuming REST Endpoint: <strong>GET /api/public/properties</strong>
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(_, val) => setTab(val)}>
          <Tab label="Public Cards Preview" sx={{ fontWeight: 700 }} />
          <Tab label="GoDaddy Embed Code Snippet" sx={{ fontWeight: 700 }} />
          <Tab label="Raw JSON Output" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {tab === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              This is an accurate simulation of how active properties are rendered on your GoDaddy website. Only properties with <strong>Active</strong> status appear here. Clicking &quot;Contact on WhatsApp&quot; opens WhatsApp with the property enquiry.
            </Alert>

            {loading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
              </Box>
            ) : error ? (
              <Alert severity="warning">{error}</Alert>
            ) : properties.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No active properties available right now. Activate a property in the admin to see it appear here!
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {properties.map((prop) => {
                  const primaryImg =
                    prop.images.find((img) => img.isPrimary)?.url ||
                    prop.images[0]?.url ||
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';

                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={prop.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={primaryImg}
                          alt={prop.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {prop.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b', mb: 1.5 }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#0d9488' }} />
                            <Typography variant="body2">{prop.location}</Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              flexGrow: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {prop.description}
                          </Typography>

                          {/* Quick Specs */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 2, color: '#64748b', fontSize: '0.85rem' }}>
                            {prop.bedrooms && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BedOutlinedIcon sx={{ fontSize: 18 }} />
                                <span>{prop.bedrooms} Bed</span>
                              </Box>
                            )}
                            {prop.bathrooms && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BathtubOutlinedIcon sx={{ fontSize: 18 }} />
                                <span>{prop.bathrooms} Bath</span>
                              </Box>
                            )}
                            {prop.maxGuests && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PeopleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                                <span>{prop.maxGuests} Guests</span>
                              </Box>
                            )}
                          </Box>

                          {/* Facilities chips */}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
                            {prop.facilities.map((fac) => (
                              <Chip
                                key={fac}
                                label={`✓ ${fac}`}
                                size="small"
                                sx={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.75rem' }}
                              />
                            ))}
                          </Box>

                          {/* WhatsApp Button */}
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<WhatsAppIcon />}
                            href={prop.whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              backgroundColor: '#25D366',
                              color: '#ffffff',
                              fontWeight: 700,
                              py: 1.2,
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: '#1ebd59',
                              },
                            }}
                          >
                            Contact on WhatsApp
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              Copy and paste this code into an <strong>HTML / Custom Code</strong> block in your GoDaddy Website Builder. It will dynamically fetch and display all Active properties with photos and WhatsApp buttons!
            </Alert>

            <Box sx={{ position: 'relative' }}>
              <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 2,
                    backgroundColor: copied ? '#10b981' : '#0f172a',
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </Tooltip>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  p: 2.5,
                  borderRadius: 2.5,
                  fontSize: '0.825rem',
                  overflowX: 'auto',
                  fontFamily: 'Consolas, Monaco, monospace',
                  lineHeight: 1.5,
                }}
              >
                {embedScript}
              </Box>
            </Box>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Live JSON payload returned by <code>GET {apiBaseUrl}/public/properties</code>:
            </Typography>
            <Box
              component="pre"
              sx={{
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                p: 2.5,
                borderRadius: 2.5,
                fontSize: '0.825rem',
                overflowX: 'auto',
                fontFamily: 'Consolas, Monaco, monospace',
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify({ success: true, count: properties.length, data: properties }, null, 2)}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
