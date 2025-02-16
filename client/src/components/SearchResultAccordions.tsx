import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NonStyledLink from './NonStyledLink';
import * as C from '../etc/consts';
import { encodeIdUrl } from '../etc/utils';
import { useTranslation } from 'react-i18next';
import { SearchAccordionType } from '../types';
import { getLDLink } from '../etc/tableUtils';
import theme from '../theme';

const path_length = C.ALL_PATHS.length;

function getHighlightedText(text: string, target: string) {
  const respArray = (text.replaceAll(target, C.HIGHLIGHTER_SAND)).split(C.HIGHLIGHTER_SPLITTER);
  return respArray.map((v) => v === C.HIGHLIGHTER_REPLACER ? <b style={{ backgroundColor: 'yellow' }}>{target}</b> : v);
}


export default function SearchResultAccordions({ accordions, q }: { accordions: SearchAccordionType[], q: string | null }) {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = React.useState<boolean[]>(
    Array.from({ length: path_length }, () => true)
  );
  
  const handleChange = (index: number) => {
    setIsExpanded((prevIsExpanded) => {
      const newIsExpanded = [...prevIsExpanded];
      newIsExpanded[index] = !newIsExpanded[index];
      return newIsExpanded;
    });
  }

  if (accordions.length === 0) {
    return (<Typography>検索結果がありません</Typography>);
  }

  return (
    <div>
      {accordions.map((accordion, index) => {
        return (
          <Accordion key={Math.random()} expanded = {isExpanded[index]} onChange={() => handleChange(index)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index + 1}a-content`}
              id={`panel${index + 1}a-header`}
            >
              <Typography>{t(`path.${accordion.title}`)}</Typography>
            </AccordionSummary>
            {accordion.content.map((c) => (
              <AccordionDetails key={Math.random()} sx={{ borderTop: `1px solid ${theme.palette.divider}`, paddingTop: `16px` }}>
                <Typography style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <NonStyledLink to={accordion.title + "/" + encodeIdUrl(c[C.AT_ID])}>
                    {c[C.SC_NAME] ? getHighlightedText(c[C.SC_NAME], q || C.HIGHLIGHTER_SAND) : ''}
                  </NonStyledLink>
                  {getLDLink(c, '')}
                </Typography>
                <Typography variant="caption">{c['schema:description'] ? getHighlightedText(c['schema:description'], q || C.HIGHLIGHTER_SAND) : ''}</Typography>
              </AccordionDetails>
            ))}
          </Accordion>
        );
      })}
    </div>
  );
}