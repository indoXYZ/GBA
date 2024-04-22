import { LinkBreakWord } from './styled.tsx';

export const URLDisplay = ({ url }: { url: URL }) => {
  return (
    <LinkBreakWord href={url.href} target="_blank">
      {url.href}
    </LinkBreakWord>
  );
};
