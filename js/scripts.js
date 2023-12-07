const global = [];
const api_call = {
  page: 1,
  param2: "",
  filterDisplay: "",
  perPage: 10,
};

//https://punkapi.com/documentation/v2

$(document).ready(function () {
  handleJSON();

  api_call.filterDisplay = "";

  $("#clearFilter").on("click", () => {
    api_call.page = 1;
    api_call.param2 = "";
    api_call.filterDisplay = "";
    $("#nameSearch").val("");
    getBeers();
  });

  $("#searchByName").on("click", () => {
    searchByName();
  });
});

$("#pageN").on("click", function () {
  if (global.data == "") return;
  let currentPage = +api_call.page;
  if (global.data.length < api_call.perPage) return;
  api_call.page = currentPage + 1;
  let page = `?page=${api_call.page}`;
  getBeers(page);
});
$("#pageP").on("click", function () {
  let currentPage = +api_call.page;
  if (currentPage == 1) return;
  api_call.page = currentPage - 1;
  let page = `?page=${api_call.page}`;
  getBeers(page);
});

const setPageNum = () => {
  $("#pageNumber").text(api_call.page);
};

const handleJSON = async () => {
  await fetch("./data/data.json")
    .then((res) => {
      return res.json();
    })
    .then((data) => (global.filters = data));

  renderFilters();
  getBeers();
};

const renderFilters = () => {
  let ibus = global.filters.ibus;
  $.each(ibus, (key, item) => {
    $("#filterByIBU").append(`
        <li>
            <a class="dropdown-item search-ibu" filter="${item.filter}" href="#">
                ${item.display}
            </a>
        </li>`);
  });

  let yeast = global.filters.yeasts;
  $.each(yeast, (key, item) => {
    $("#filterByYeast").append(`
        <li>
            <a class="dropdown-item search-yeast" href="#">
                ${item.yeastname}
            </a>
        </li>`);
  });

  $(".search-yeast").on("click", (e) => {
    let yeast = `?yeast=${e.currentTarget.innerText}`;
    api_call.page = 1;
    api_call.param2 = `&yeast=${e.currentTarget.innerText}`;
    api_call.filterDisplay = e.currentTarget.innerText;
    getBeers();
  });

  $(".search-ibu").on("click", (e) => {
    let ibu = `?${e.currentTarget.attributes["filter"].nodeValue}`;
    api_call.page = 1;
    api_call.param2 = `&${e.currentTarget.attributes["filter"].nodeValue}`;
    api_call.filterDisplay = e.currentTarget.innerText;
    getBeers();
  });
};

const searchByName = () => {
  let search = $("#nameSearch").val().replace(" ", "_");
  api_call.page = 1;
  api_call.param2 = `&beer_name=${search}`;
  api_call.filterDisplay = search;
  getBeers();
};

const renderTableHeader = () => {
  $("#PageNum").text(`Page #: ${api_call.page}`);
  $("#filterDisplay").text(api_call.filterDisplay);
};

const renderBeers = () => {
  $("#beerTable tbody").empty();

  $.each(global.data, (key, item) => {
    $("#beerTable").append(
      `<tr>
            <td>
                <a href="#" class="beer" id="${item.id}">${item.name}</a>
            </td>
            <td>${item.tagline}</td>
            <td style="background-Color:${getSRM(Math.round(item.srm))}"> </td>
            <td>${item.ibu}</td>
            <td>${item.abv}</td>
        </tr>`
    );
  });
  renderTableHeader();
  setPageNum();
  $(".beer").on("click", (e) => {
    let id = e.currentTarget.id;
    const beer = global.data.filter((item) => {
      return item.id == id;
    });
    global.beer = beer;
    renderBeerModal();
    //setBeerColor();
  });
};

const getSRM = (srm) => {
  if (srm > 41) srm = 41;
  if (!srm) srm = 1;
  return global.filters.SRM[srm];
};

const renderBeerModal = () => {
  const beer = global.beer[0];
  $("#offcanvasBeer").offcanvas("show");
  $("#beerName").html(beer.name);
  $("#beerImg").attr("src", beer.image_url);
  $("#beerTips").text(beer.brewers_tips);
  $("#beerDescr").text(beer.description);
  const recipe = beer.ingredients;
  $("#beerMalts").empty();
  $.each(recipe.malt, (key, item) => {
    $("#beerMalts").append(
      `<li>${convertKGs(item.amount.value)} lbs ${item.name}</li>`
    );
  });
  $("#beerHops").empty();
  $.each(recipe.hops, (key, item) => {
    $("#beerHops").append(`<li>${convertGrams(item.amount.value)} oz ${
      item.name
    } 
        <span class="float-end">${item.attribute} - ${formatHopAddition(
      item.add
    )}</span>
        </li>`);
  });
  $("#beerYeast").text(recipe.yeast);
  $("#beerBoilVolume").text(`${convertLiters(beer.boil_volume.value)} GL`);
  $("#beerVolume").text(`${convertLiters(beer.volume.value)} GL`);
  $("#beerGravStart").text(`OG: ${beer.target_og}`);
  $("#beerGravEnd").text(`FG: ${beer.target_fg}`);
  $("#beerIBU").text(`IBU: ${beer.ibu}`);
  $("#beerABV").text(`ABV: ${beer.abv}`);
  $("#beerMash").empty();

  $.each(beer.method.mash_temp, (key, item) => {
    $("#beerMash").append(
      `<li>${convertCelcius(item.temp.value)} degrees for ${
        item.duration
      } minutes</li>`
    );
  });
  $("#beerFerment").text(
    `${convertCelcius(beer.method.fermentation.temp.value)} degrees`
  );
  $("#beerFood").empty()
  $.each(beer.food_pairing, (key, item) => {
    $("#beerFood").append(`<li>${item}</li>`);
  });
};

const convertKGs = (kg) => {
  return +(kg * 2.205).toFixed(2);
};
const convertGrams = (g) => {
  return +(g / 28.35).toFixed(2);
};
const formatHopAddition = (item) => {
  if (isNaN(item)) return item;
  return `${item} minutes`;
};
const convertLiters = (ltr) => {
  return (+ltr / 3.785).toFixed(2);
};
const convertCelcius = (cel) => {
  return (+cel * 1.8 + 32).toFixed(1);
};

//filters

const getBeers = () => {
  let param = `?page=${api_call.page}${api_call.param2}&per_page=${api_call.perPage}`;
  console.log(param);
  let url = `https://api.punkapi.com/v2/beers${param}`;
  AjaxCall(url).done(function (result) {
    global.data = result;
    renderBeers();
  });
};

function AjaxCall(url) {
  return $.ajax({
    url: url,
    type: "GET",
    success: function (result) {},
  });
}
