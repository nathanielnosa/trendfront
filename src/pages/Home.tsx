import { toApiError } from "../lib/api/errors";
import { useCategories, usePosts } from "../lib/api/queries";
import { EmptyNotice, ErrorNotice } from "../components/StateMessage";
import { FeaturedHero, FeaturedHeroSkeleton } from "../components/blog/FeaturedHero";
import { PostCard, PostCardSkeleton } from "../components/blog/PostCard";
import { SectionHeader } from "../components/blog/SectionHeader";
import { TrendingList } from "../components/blog/TrendingList";
import { Reveal, Skeleton, Tag } from "../components/ui";
import "./Home.css";

/** How many latest posts to show under the hero. */
const LATEST_COUNT = 9;

/** The home page: featured hero, category chips, trending list and latest posts. */
export function Home() {
  const featured = usePosts({ featured: true, page_size: 1 });
  const trending = usePosts({ trending: true, page_size: 5 });
  const latest = usePosts({ page_size: LATEST_COUNT + 1 });
  const categories = useCategories();

  // The hero is the featured post, or the newest post if none is featured.
  const heroPost = featured.data?.results[0] ?? latest.data?.results[0];
  // Do not repeat the hero post in the grid below it.
  const latestPosts = (latest.data?.results ?? []).filter((post) => post.id !== heroPost?.id).slice(0, LATEST_COUNT);
  const trendingPosts = trending.data?.results ?? [];

  const heroLoading = featured.isPending || (!featured.data?.results.length && latest.isPending);

  return (
    <div className="home">
      {heroLoading ? <FeaturedHeroSkeleton /> : heroPost && <FeaturedHero post={heroPost} />}

      <nav className="home__chips" aria-label="Categories">
        {categories.isPending && <Skeleton width={260} height="2rem" radius="var(--radius-pill)" />}
        {categories.data?.map((category) => (
          <Tag key={category.id} to={`/category/${category.slug}`}>
            {category.name}
          </Tag>
        ))}
      </nav>

      {trendingPosts.length > 0 && (
        <Reveal>
          <section className="home__section">
            <SectionHeader title="Trending now" />
            <TrendingList posts={trendingPosts} />
          </section>
        </Reveal>
      )}

      <section className="home__section">
        <SectionHeader title="Latest stories" linkTo="/posts" linkLabel="All posts" />

        {latest.isError ? (
          <ErrorNotice message={toApiError(latest.error).message} onRetry={() => void latest.refetch()} />
        ) : latest.isPending ? (
          <div className="home__grid">
            {Array.from({ length: 6 }, (_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        ) : latestPosts.length === 0 && !heroPost ? (
          <EmptyNotice title="No stories yet" text="Fresh posts will show up here as soon as they are published." />
        ) : (
          <div className="home__grid">
            {latestPosts.map((post, index) => (
              <Reveal key={post.id} delay={(index % 3) * 80}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
