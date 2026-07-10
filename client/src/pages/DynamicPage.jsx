import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../services/adminApi';
import Seo from '../components/utils/Seo';
import PageBlock from '../components/pageblocks/PageBlock';
import PageLoader from '../components/utils/PageLoader';
import NotFoundPage from './NotFoundPage';

/**
 * Renders a marketing-built page by its slug. Only published pages resolve;
 * anything missing/draft falls through to the 404 page.
 */
const DynamicPage = () => {
  const { slug } = useParams();
  // `loaded` tracks which slug the result belongs to, so we show the loader when
  // navigating to a new slug without a synchronous setState inside the effect.
  const [data, setData] = useState({ slug: null, page: null });

  useEffect(() => {
    let alive = true;
    fetchPageBySlug(slug)
      .then((d) => alive && setData({ slug, page: d.page }))
      .catch(() => alive && setData({ slug, page: null }));
    return () => { alive = false; };
  }, [slug]);

  if (data.slug !== slug) return <PageLoader />;
  if (!data.page) return <NotFoundPage />;

  const p = data.page;
  return (
    <div className="dynamic-page">
      <Seo
        title={p.seo?.title || p.title}
        description={p.seo?.description || ''}
        path={`/${p.slug}`}
        noindex={Boolean(p.seo?.noindex)}
      />
      {(p.blocks || []).map((b, i) => <PageBlock key={i} block={b} />)}
    </div>
  );
};

export default DynamicPage;
