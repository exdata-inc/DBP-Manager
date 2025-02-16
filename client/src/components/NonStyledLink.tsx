import { Link } from "react-router-dom";
import { styled } from '@mui/material/styles';

export const linkStyle = {
  color: 'inherit',
  fontFamily: 'Consolas, "BIZ UDPGothic", Roboto, "Helvetica Neue", Arial, sans-serif',
  cursor: 'pointer',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
  WebkitBoxOrient: 'vertical',
  // textDecoration: 'none',
};

const NonStyledLink = styled(Link)(({ theme }) => linkStyle);
  
export default NonStyledLink;
