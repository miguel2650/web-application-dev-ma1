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

  // Close modal when clicking close button
  $(".close-modal").on("click", () => {
    $("#modal").css("display", "none");
  });

  // Allows the user to click outside the modal to close it
  $("#modal").on("click", (e) => {
    if (e.target.id === "modal") {
      $("#modal").css("display", "none");
    }
  });

  $(document).on("click", ".list-item", (e) => {
    // Gets the id (format: list-item-ID) and removes everything but the index
    const selectedItem = e.currentTarget.id;
    console.log("tesss ", selectedItem);
    $.ajax({
      url: `https://api.themoviedb.org/3/movie/${selectedItem}?api_key=3edfa3f6e56c68eee27890cbd23d931f&language=en-US`,
      type: "GET",
    }).done((data) => {
      console.log(data);
      $("#modal").css("display", "block");
      $("#modal-title").text(
        `${data.title}, ${data.original_language}, ${data.runtime} minutes`
      );
      $("#modal-link").text(data.homepage).attr("href", data.homepage);
      $("#modal-overview").text(`${data.overview}`);

      // Function to loop over lists and concat string
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

      $("#modal-genres").text(`Genres: ${loopList(data.genres)}`);
      $("#modal-companies").text(
        `Companies: ${loopList(data.production_companies)}`
      );
      $.ajax({
        url: `https://api.themoviedb.org/3/movie/${selectedItem}/credits?api_key=3edfa3f6e56c68eee27890cbd23d931f`,
        type: "GET",
      }).done((data) => {
        console.log(data);
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
  });

  const searchClicked = () => {
    if ($("#inputvalue").val().length <= 0) {
      $("#search-message").text("Searching for nothing is pretty boring ...");
    } else {
      $("#search-message").text("Searching ...");
      $.ajax({
        url: `https://api.themoviedb.org/3/search/multi?api_key=3edfa3f6e56c68eee27890cbd23d931f&language=en-US&page=1&include_adult=false&query=${$(
          "#inputvalue"
        ).val()}`,
        type: "GET",
      })
        .done((data) => {
          if (data.results.length <= 0) {
            $("#search-message").text("No results");
          } else {
            $(".movie").remove();
            $("#search-message").text("");
            data.results.forEach((item, index) => {
              if (item.media_type === "movie") {
                $(".result-list").append(
                  `<div class="list-item" id=${item.id}>
                <p>&#128250</p>
                    <h1>${item.title}, ${item.release_date}, ${item.original_language}</h1>
                    </div>`
                );
              } else if (item.media_type === "person") {
                $(".result-list")
                  .append(`<div class="list-item" id=list-item-${index}>
                <p>&#129333</p>
                    <h1>${item.name}, ${item.known_for_department}</h1>
                    </div>`);
              }
            });
            console.log(data);
          }
          mydata = data.results;
        })
        .fail((error) => {
          $("#search-message").text(error);
        });
    }
  };
});
