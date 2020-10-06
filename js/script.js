$(document).ready(() => {
  // Allows the user to seach by clicking the search button
  $("#search").on("click", () => {
    searchClicked();
  });

  // Allows the user to press enter when submitting a search
  $("#inputvalue").keypress((e) => {
    if (e.keyCode === 13) {
      searchClicked();
    }
  });

  // Since not every entry has the same attributes
  // the text must be remove from the modal fields.
  const removeModalText = () => {
    $(
      "#modal-title, #modal-link, #modal-overview, #modal-genres, #modal-companies, #modal-actors, #modal-directors, #modal-script, #modal-execprod, #modal-producers, #modal-music"
    ).text("");
  };
  // Close modal when clicking close button
  $(".close-modal").on("click", () => {
    $("#modal").css("display", "none");
    removeModalText();
  });

  // Allows the user to click outside the modal to close it
  $("#modal").on("click", (e) => {
    if (e.target.id === "modal") {
      $("#modal").css("display", "none");
      removeModalText();
    }
  });

  // Allows user to click on a list item to open up a
  // modal with more detailed information of either a person or a movie.
  $(document).on("click", ".list-item", (e) => {
    // Gets the selected id and splits it by "-".
    // Format is as follows: id=type-id (example: id=person-6733)
    const [selectedType, selectedId] = e.currentTarget.id.split("-");

    // Function to loop over lists and concat string
    // Returns string-list.
    let loopList = (list) => {
      let loopedList = "";
      list.forEach((item, index) => {
        // Idk if this is good or bad practice?
        // Saved some lines of code by using the same function.
        if (item.character) {
          loopedList += item.name + ` (${item.character})`;
        } else {
          loopedList += item.name;
        }
        if (index != list.length - 1) {
          loopedList += ", ";
        }
      });
      return loopedList;
    };

    // Function to loop over list of jobs.
    // Returns string-list.
    let loopJobs = (list, jobName) => {
      let loopedList = "";
      list.forEach((item, index) => {
        if (item.job === jobName) {
          console.log(item.job);
          loopedList += item.name;
          if (index != list.length - 1) {
            loopedList += ", ";
          }
        }
      });
      return loopedList;
    };

    // Movies.
    if (selectedType === "movie") {
      // API call gets detailed movie infomation.
      $.ajax({
        url: `https://api.themoviedb.org/3/movie/${selectedId}?api_key=3edfa3f6e56c68eee27890cbd23d931f&language=en-US`,
        type: "GET",
      }).done((data) => {
        console.log(data);
        // Adds context to the modal.
        $("#modal").css("display", "block");
        $("#modal-title").text(
          `${data.title}, ${data.original_language}, ${data.runtime} minutes`
        );
        $("#modal-link").text(data.homepage).attr("href", data.homepage);
        $("#modal-overview").text(`${data.overview}`);
        $("#modal-genres").text(`Genres: ${loopList(data.genres)}`);
        $("#modal-companies").text(
          `Companies: ${loopList(data.production_companies)}`
        );
        // API call gets cedits from selected movie.
        $.ajax({
          url: `https://api.themoviedb.org/3/movie/${selectedId}/credits?api_key=3edfa3f6e56c68eee27890cbd23d931f`,
          type: "GET",
        }).done((data) => {
          console.log(data);
          // Adds context to the modal.
          $("#modal-actors").text(`Actors: ${loopList(data.cast)}`);
          $("#modal-directors").text(
            `Directors: ${loopJobs(data.crew, "Director")}`
          );
          $("#modal-script").text(
            `Script writers: ${loopJobs(data.crew, "Script")}`
          );
          $("#modal-execprod").text(
            `Executive Producers, ${loopJobs(data.crew, "Executive Producers")}`
          );
          $("#modal-producers").text(
            `Producers: ${loopJobs(data.crew, "Producer")}`
          );
          $("#modal-music").text(
            `Music Composers: ${loopJobs(data.crew, "Music Composer")}`
          );
        });
      });

      // Person
    } else if (selectedType === "person") {
      // API call gets detailed infomation about a person.
      $.ajax({
        url: `https://api.themoviedb.org/3/person/${selectedId}?api_key=3edfa3f6e56c68eee27890cbd23d931f&language=en-US`,
        type: "GET",
      }).done((data) => {
        console.log(data);
        // Adds context to the modal.
        $("#modal").css("display", "block");
        $("#modal-title").text(data.name);
        $("#modal-link").text(data.homepage).attr("href", data.homepage);
        $("#modal-overview").text(
          "Main activity: " + data.known_for_department
        );
        $("#modal-genres").text("Birthday: " + data.birthday);
        if (data.deathday !== null) {
          $("#modal-companies").text("Day of decease: " + data.deathday);
        }
        $("#modal-actors").text("Biography: " + data.biography);
        // API call gets information about which
        // movie the selected person has participated in.
        $.ajax({
          url: `https://api.themoviedb.org/3/person/${selectedId}/movie_credits?api_key=3edfa3f6e56c68eee27890cbd23d931f&language=en-US`,
          type: "GET",
        }).done((data) => {
          $("#modal-directors").text(
            `Movies: ${loopList(data.title)}, ${loopList(data.release_date)}, ${
              data.charater
            }`
          );
        });
      });
    }
  });

  // Allows user to search for movies and persons in
  // a combined search field.
  const searchClicked = () => {
    if ($("#inputvalue").val().length <= 0) {
      $("#search-message").text("Searching for nothing is pretty boring ...");
    } else {
      $("#search-message").text("Searching ...");
      // API call gets all infomation related to users inputted value
      // using multi search (person and movies).
      $.ajax({
        url: `https://api.themoviedb.org/3/search/multi?api_key=3edfa3f6e56c68eee27890cbd23d931f&language=en-US&page=1&include_adult=false&query=${$(
          "#inputvalue"
        ).val()}`,
        type: "GET",
      })
        .done((data) => {
          // Clear the current list items to avoid appending to old search.
          $(".list-item").remove();
          if (data.results.length <= 0) {
            $("#search-message").text("No results");
          } else {
            $("#search-message").text("");
            // Loop to add all items to the "result window".
            data.results.forEach((item, index) => {
              if (item.media_type === "movie") {
                $(".result-list").append(
                  `<div class="list-item" id=movie-${item.id}>
                <p>&#128250</p>
                    <h3>${item.title}, ${item.release_date}, ${item.original_language}</h3>
                    </div>`
                );
              } else if (item.media_type === "person") {
                $(".result-list")
                  .append(`<div class="list-item" id=person-${item.id}>
                <p>&#129333</p>
                    <h3>${item.name}, ${item.known_for_department}</h3>
                    </div>`);
              }
            });
            console.log(data);
          }
        })
        .fail((error) => {
          $("#search-message").text(error);
        });
    }
  };
});
