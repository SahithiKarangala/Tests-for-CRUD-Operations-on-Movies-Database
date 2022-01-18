const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getMovieDetails = (movieObj) => {
  return {
    movieId: movieObj.movie_id,
    directorId: movieObj.director_id,
    movieName: movieObj.movie_name,
    leadActor: movieObj.lead_actor,
  };
};

const getDirectorDetails = (direObj) => {
  return {
    directorId: direObj.director_id,
    directorName: direObj.director_name,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * FROM movie 
        WHERE 
        movie_id=${movieId};
    `;
  const getMovie = await db.get(getMovieQuery);
  console.log(getMovie);
  response.send(getMovieDetails(getMovie));
});

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
        SELECT 
        movie_name
         FROM 
         movie;
    `;
  const movieNameList = await db.all(getMovieNamesQuery);
  console.log(movieNameList);
  response.send(
    movieNameList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (Request, Response) => {
  let movieDetails = Request.body;
  let { directorId, movieName, leadActor } = movieDetails;
  const addMoviesQuery = `
     INSERT INTO movie 
     (director_id,movie_name,lead_actor) 
     VALUES (${directorId},'${movieName}','${leadActor}');
    `;
  const dbResponse = await db.run(addMoviesQuery);
  console.log(dbResponse.lastID);
  Response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  let movieDetails = request.body;
  let { directorId, movieName, leadActor } = movieDetails;

  const putMovieQuery = `
    UPDATE movie SET director_id=${directorId},movie_name='${movieName}',
    lead_actor='${leadActor}' WHERE movie_id=${movieId};
    `;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id=${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorDetailsQuery = `
    SELECT * FROM director;
    `;
  const directorsList = await db.all(getDirectorDetailsQuery);
  response.send(directorsList.map((each) => getDirectorDetails(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNameQuery = `
    SELECT movie_name FROM movie WHERE 
    director_id=${directorId};
    `;
  const movieList = await db.all(getMovieNameQuery);
  response.send(movieList.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;
