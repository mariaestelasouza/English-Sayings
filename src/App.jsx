import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { CATEGORIES, SAYINGS, TYPES, TYPE_TAGS } from './data.js';

const PRO_ITEMS = SAYINGS.filter((s) => s.type === 'polite');
const OTHER_ITEMS = SAYINGS.filter((s) => s.type !== 'polite');
const OTHER_TYPES = Object.entries(TYPES).filter(([key]) => key !== 'polite');

const SECTIONS = {
  pro: {
    tab: 'How to Say It Professionally',
    icon: <BusinessCenterIcon />,
    title: 'How to Say It Professionally',
    subtitle: `${PRO_ITEMS.length} rude or blunt phrases turned into respectful, professional English. Tap a phrase to see what to avoid, why the new version works, and two examples.`,
    search: 'Search phrases, e.g. "busy", "wrong", "hurry"',
  },
  sayings: {
    tab: 'English Sayings & Expressions',
    icon: <MenuBookIcon />,
    title: 'English Sayings & Expressions',
    subtitle: `${OTHER_ITEMS.length} proverbs, idioms, phrasal verbs, natural phrases and business expressions, grouped by theme. Tap one to see its meaning and two examples.`,
    search: 'Search sayings, meanings or examples',
  },
};


const TYPE_COLORS = {
  proverb: 'secondary',
  idiom: 'success',
  phrasal: 'error',
  natural: 'info',
  business: 'primary',
};

const MEANING_LABEL = { business: 'When to use', polite: 'Why it works' };

function PrivacyNotice({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PrivacyTipIcon color="primary" /> Privacy notice
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          What we count
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Each time the app is opened, we add 1 to a counter for that day. We also count how many requests each part of
          our server receives per day (for example, "app opened"). That is all we collect: numbers per day.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          What we do not collect
        </Typography>
        <Typography component="ul" sx={{ mt: 0, pl: 3 }}>
          <li>No names, emails or accounts</li>
          <li>No IP addresses or location</li>
          <li>No cookies or tracking IDs</li>
          <li>No record of what you search or which phrases you open</li>
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          Why we count
        </Typography>
        <Typography sx={{ mb: 2 }}>
          To see how many people use the app each day, so we know if it is helpful and worth improving.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          Questions
        </Typography>
        <Typography>Contact: estela.souza.98@gmail.com </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Last updated: 27/11/2026
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SayingItem({ item, expanded, onToggle }) {
  const isPolite = item.type === 'polite';
  return (
    <Accordion
      id={`s-${item.id}`}
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      elevation={0}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        borderRadius: 2,
        '&:before': { display: 'none' },
        border: 1,
        borderColor: expanded ? 'primary.main' : 'divider',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', pr: 1 }}>
          <Typography sx={{ fontWeight: 600, flex: 1 }}>{item.saying}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {!isPolite && (
              <Chip size="small" variant="outlined" color={TYPE_COLORS[item.type]} label={TYPE_TAGS[item.type]} />
            )}
            {!item.original && <Chip size="small" variant="outlined" color="warning" label="Extra" />}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
        {item.plain && (
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'flex-start' }}>
            {isPolite && <CancelIcon color="error" fontSize="small" sx={{ mt: '2px' }} />}
            <Typography color={isPolite ? 'error' : 'text.secondary'}>
              <strong>{isPolite ? 'Instead of saying:' : 'Instead of:'}</strong> "{item.plain}"
            </Typography>
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'flex-start' }}>
          {isPolite && <CheckCircleIcon color="success" fontSize="small" sx={{ mt: '2px' }} />}
          <Typography>
            <Box component="strong" sx={{ color: isPolite ? 'success.main' : 'inherit' }}>
              {MEANING_LABEL[item.type] || 'Meaning'}:
            </Box>{' '}
            {item.meaning}
          </Typography>
        </Stack>
        <Typography variant="overline" color="text.secondary">
          Examples
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 3 }}>
          {item.examples.map((ex, i) => (
            <Typography component="li" key={i} sx={{ fontStyle: 'italic', mb: 0.5 }}>
              {ex}
            </Typography>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDark ? 'dark' : 'light',
          primary: { main: prefersDark ? '#a78bfa' : '#7c3aed' },
          background: prefersDark
            ? { default: '#17131d', paper: '#221c2b' }
            : { default: '#f6f1fb', paper: '#ffffff' },
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          button: { textTransform: 'none', fontWeight: 600 },
        },
      }),
    [prefersDark]
  );

  const [section, setSection] = useState('pro');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [openIds, setOpenIds] = useState(() => new Set());
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const byType = useMemo(
    () =>
      section === 'pro'
        ? PRO_ITEMS
        : OTHER_ITEMS.filter((s) => type === 'all' || s.type === type),
    [section, type]
  );

  const counts = useMemo(() => {
    const c = {};
    byType.forEach((s) => (c[s.category] = (c[s.category] || 0) + 1));
    return c;
  }, [byType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byType.filter(
      (s) =>
        (category === 'all' || s.category === category) &&
        (!q ||
          s.saying.toLowerCase().includes(q) ||
          s.meaning.toLowerCase().includes(q) ||
          (s.plain && s.plain.toLowerCase().includes(q)) ||
          s.examples.some((e) => e.toLowerCase().includes(q)))
    );
  }, [byType, category, query]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((s) => (g[s.category] ||= []).push(s));
    return Object.keys(CATEGORIES)
      .filter((k) => g[k])
      .map((k) => [k, g[k].sort((a, b) => a.saying.localeCompare(b.saying))]);
  }, [filtered]);

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const expandAll = () => setOpenIds(new Set(filtered.map((s) => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  const randomSaying = () => {
    const pick = byType[Math.floor(Math.random() * byType.length)];
    setQuery('');
    setCategory(pick.category);
    setOpenIds(new Set([pick.id]));
    setTimeout(() => {
      document.getElementById(`s-${pick.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const changeType = (t) => {
    setType(t);
    setCategory('all');
  };

  const changeSection = (key) => {
    setSection(key);
    setType('all');
    setCategory('all');
    setQuery('');
    setOpenIds(new Set());
  };

  const current = SECTIONS[section];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs value={section} onChange={(_, v) => changeSection(v)} variant="fullWidth" aria-label="Main sections">
            {Object.entries(SECTIONS).map(([key, sec]) => (
              <Tab key={key} value={key} icon={sec.icon} iconPosition="start" label={sec.tab} sx={{ fontWeight: 700 }} />
            ))}
          </Tabs>
        </Paper>

        <Box component="header" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {current.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {current.subtitle}
          </Typography>
        </Box>

        {section === 'sayings' && (
          <Paper variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
            <Tabs value={type} onChange={(_, v) => changeType(v)} variant="scrollable" scrollButtons="auto" aria-label="Types">
              {[['all', 'All'], ...OTHER_TYPES].map(([key, label]) => (
                <Tab
                  key={key}
                  value={key}
                  label={`${label} (${key === 'all' ? OTHER_ITEMS.length : OTHER_ITEMS.filter((s) => s.type === key).length})`}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            type="search"
            placeholder={current.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button variant="outlined" startIcon={<UnfoldMoreIcon />} onClick={expandAll}>
              Expand all
            </Button>
            <Button variant="outlined" startIcon={<UnfoldLessIcon />} onClick={collapseAll}>
              Collapse
            </Button>
            <Button variant="contained" startIcon={<CasinoIcon />} onClick={randomSaying}>
              Random
            </Button>
          </Stack>
        </Stack>

        {category === 'all' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip label={`All categories (${byType.length})`} color="primary" variant="filled" />
            {Object.entries(CATEGORIES)
              .filter(([key]) => counts[key])
              .map(([key, cat]) => (
                <Chip
                  key={key}
                  label={`${cat.emoji} ${cat.name} (${counts[key]})`}
                  color="primary"
                  variant="outlined"
                  onClick={() => setCategory(key)}
                />
              ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 3 }}>
            <Chip
              label={`${CATEGORIES[category].emoji} ${CATEGORIES[category].name} (${counts[category] || 0})`}
              color="primary"
              variant="filled"
              onClick={() => setCategory('all')}
              onDelete={() => setCategory('all')}
              title="Remove filter"
            />
            <Button size="small" endIcon={<ExpandMoreIcon />} onClick={() => setCategory('all')}>
              Show all categories
            </Button>
          </Box>
        )}

        <Box component="main">
          {grouped.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
              Nothing matches your search.
            </Typography>
          )}
          {grouped.map(([key, items]) => (
            <Box component="section" key={key} sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {CATEGORIES[key].emoji} {CATEGORIES[key].name}{' '}
                <Typography component="span" color="text.secondary" variant="body2">
                  {items.length}
                </Typography>
              </Typography>
              <Stack spacing={1}>
                {items.map((item) => (
                  <SayingItem key={item.id} item={item} expanded={openIds.has(item.id)} onToggle={() => toggle(item.id)} />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
          "Extra" marks entries added beyond the original source lists.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          We only count visits per day, nothing personal.{' '}
          <Link component="button" variant="body2" onClick={() => setPrivacyOpen(true)}>
            Privacy notice
          </Link>
        </Typography>
        <PrivacyNotice open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      </Container>
    </ThemeProvider>
  );
}
