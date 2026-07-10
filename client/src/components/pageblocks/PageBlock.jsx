import React from 'react';
import {
  HeroBlock, HeadingBlock, RichTextBlock, CtaBlock,
  ImageBlock, TwoColumnBlock, GetQuoteBlock,
} from './blocks';

// Block type → component. Unknown types render nothing (forward-compatible).
const MAP = {
  hero: HeroBlock, heading: HeadingBlock, richtext: RichTextBlock, cta: CtaBlock,
  image: ImageBlock, twoColumn: TwoColumnBlock, getQuote: GetQuoteBlock,
};

const PageBlock = ({ block }) => {
  const Comp = MAP[block?.type];
  return Comp ? <Comp {...block} /> : null;
};

export default PageBlock;
