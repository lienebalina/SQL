import { Database } from "../src/database";
import { ACTORS, DIRECTORS, GENRES, KEYWORDS, MOVIES, MOVIE_ACTORS, MOVIE_DIRECTORS, MOVIE_GENRES, MOVIE_KEYWORDS, MOVIE_RATINGS } from "../src/table-names";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
      const query = `select round(sum(movies.budget_adjusted),2) as total_budget, full_name as director from ${DIRECTORS} 
        join ${MOVIE_DIRECTORS} on directors.id = movie_directors.director_id
        join ${MOVIES} on movies.id = movie_directors.movie_id
        group by director 
        order by total_budget desc 
        limit 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => {
      const query = `select keyword, count(*) as count from ${KEYWORDS}
      join ${MOVIE_KEYWORDS} on keywords.id = movie_keywords.keyword_id
      join ${MOVIES} on movies.id = movie_keywords.movie_id
      group by keyword
      order by count desc
      limit 10`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select all movies called Life and return amount of actors",
    async done => {
      const query = `select original_title, count(*) as count from ${MOVIES}
      join ${MOVIE_ACTORS} on movies.id = movie_actors.movie_id
      join ${ACTORS} on actors.id = movie_actors.actor_id
      where original_title = 'Life'`;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which has most ratings with 5 stars",
    async done => {
      const query = `select genre, count(*) as five_stars_count from ${GENRES}
      join ${MOVIE_GENRES} on genres.id = movie_genres.genre_id
      join ${MOVIE_RATINGS} on movie_ratings.movie_id = movie_genres.movie_id
      where movie_ratings.rating = '5.0'
      group by genre
      order by five_stars_count desc
      limit 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
      const query = `select genre, round(avg(movie_ratings.rating),2) as avg_rating from ${GENRES}
      join ${MOVIE_GENRES} on genres.id = movie_genres.genre_id
      join ${MOVIE_RATINGS} on movie_ratings.movie_id = movie_genres.movie_id
      group by genre
      order by avg_rating desc
      limit 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});
