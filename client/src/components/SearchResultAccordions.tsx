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

function getHighlightedText(text: string, target: string, ignoreCase: boolean= true): (string | JSX.Element)[] {
  const regex = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ignoreCase ? 'gi' : 'g');

  const result: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    if (match.index === undefined) continue;
    const start = match.index;
    const end = start + match[0].length;

    // 通常文字列
    if (lastIndex < start) {
      result.push(text.slice(lastIndex, start));
    }

    // マッチした原文をハイライト
    result.push(
      <b key={start} style={{ backgroundColor: 'yellow' }}>
        {match[0]}
      </b>
    );

    lastIndex = end;
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
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