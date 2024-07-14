$(document).ready(() => {
  closeSideNavInstant();
  $(".open-close-icon").click(() => {
    if ($("#sideBar").css("left") == "0px") {
      closeSideNav();
    } else {
      openSideNav();
    }
  });
  function closeSideNavInstant() {
    $("#sideBar").css("left", `-${$(".sidBarMenu").innerWidth()}px`);
    $(".open-close-icon").addClass("fa-bars").removeClass("fa-xmark");
  }

  // Side Bar Links Navigation
  $("#sidBarMenu a").click(function (e) {
    e.preventDefault();
    let page = $(this).data("page");
    navigateTo(page);
  });
});

async function fetchMealsWithEmptyQuery() {
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s="
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch meals: ${response.status}`);
  }
  const data = await response.json();
  displayMeals(data.meals);
}

document.addEventListener("DOMContentLoaded", function () {
  fetchMealsWithEmptyQuery();
});

function openSideNav() {
  $(".sideBar").animate({ left: 0 }, 1000);
  $(".open-close-icon").removeClass("fa-bars").addClass("fa-xmark");
}

function closeSideNav() {
  $("#sideBar").animate({ left: `-${$(".sidBarMenu").innerWidth()}px` }, 1000);
  $(".open-close-icon").removeClass("fa-xmark").addClass("fa-bars");
}

function navigateTo(page) {
  const content = document.querySelector("#content");
  closeSideNav();
  switch (page) {
    case "search":
      content.innerHTML = getSearchPageContent();
      setupSearchPage();
      break;
    case "categories":
      content.innerHTML = getCategories();
      break;
    case "areas":
      content.innerHTML = getAreas();
      break;
    case "ingredients":
      content.innerHTML = getIngredientsPage();
      break;
    case "contact":
      showContacts();
      break;
  }
}

function getSearchPageContent() {
  return `
        <div class="form-row d-flex justify-content-center align-items-center">
            <div class="form-group col-md-6 m-2">
                <input type="text" class="form-control my-2" id="searchByName" placeholder="Search by Meal Name">
            </div>
            <div class="form-group col-md-6">
                <input type="text" class="form-control my-2" id="searchByLetter" placeholder="Search by First Letter" maxlength="1">
            </div>
        </div>
        <div id="mealResults" class="row mt-4"></div>
    `;
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function setupSearchPage() {
  const searchByNameInput = document.querySelector("#searchByName");
  const searchByLetterInput = document.querySelector("#searchByLetter");
  const mealResults = document.querySelector("#mealResults");
  searchByNameInput.addEventListener("input", async function () {
    const query = this.value.trim();
    if (query.length > 0) {
      const data = await fetchData(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      displayMealResults(data.meals);
    } else {
      mealResults.innerHTML = "";
    }
  });

  searchByLetterInput.addEventListener("input", async function () {
    const query = this.value.trim();
    if (query.length === 1) {
      const data = await fetchData(
        `https://www.themealdb.com/api/json/v1/1/search.php?f=${query}`
      );
      displayMealResults(data.meals);
    } else {
      mealResults.innerHTML = "";
    }
  });

  function displayMealResults(meals) {
    mealResults.innerHTML = "";
    if (meals && meals.length > 0) {
      let mealList = ``;
      meals.forEach((meal) => {
        mealList += `
                    <div class="col-md-4 mb-4">
                        <div class="item" data-id="${meal.idMeal}">
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                            <div class="overlay">
                                <div class="text-container">
                                    <h3>${meal.strMeal}</h3>
                                </div>
                            </div>
                        </div>
                    </div>`;
      });
      mealResults.innerHTML = `<div class="row">${mealList}</div>`;

      const mealItems = document.querySelectorAll(".item[data-id]");
      mealItems.forEach((item) => {
        item.addEventListener("click", function () {
          showMealDetails(this.getAttribute("data-id"));
        });
      });
    } else {
      mealResults.innerHTML = "<p>No meals found.</p>";
    }
  }
}

async function getCategories() {
  const data = await fetchData(
    "https://www.themealdb.com/api/json/v1/1/categories.php"
  );
  displayCategories(data.categories);
}

function displayCategories(categories) {
  let cartona = ``;
  for (let i = 0; i < categories.length; i++) {
    cartona += `<div class="col-md-4">
            <div class="item my-4" data-category="${categories[i].strCategory}">
                <img src="${categories[i].strCategoryThumb}" alt="${
      categories[i].strCategory
    }">
                <div class="overlay">
                    <div class="text-container">
                        <h3>${categories[i].strCategory}</h3>
                        <p>${
                          categories[i].strCategoryDescription
                            ? categories[i].strCategoryDescription
                            : "No description available"
                        }</p>
                    </div>
                </div>
            </div>
        </div>`;
  }
  document.querySelector("#content").innerHTML = cartona;

  const categoryItems = document.querySelectorAll(".item[data-category]");
  categoryItems.forEach((item) => {
    item.addEventListener("click", function () {
      showMeals(this.getAttribute("data-category"));
    });
  });
}

async function showMeals(categoryName) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`
  );
  displayMeals(data.meals);
}

function displayMeals(meals) {
  let mealList = ``;
  for (let i = 0; i < meals.length; i++) {
    mealList += `
        <div class="col-md-3">
                <div onclick="showMealDetails('${meals[i].idMeal}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <img class="w-100 m-3" src="${meals[i].strMealThumb}" alt="" srcset="">
                    <div class="meal-layer position-absolute d-flex align-items-center text-black p-2">
                        <h3>${meals[i].strMeal}</h3>
                    </div>
                </div>
        </div>
        `;
  }
  document.querySelector("#content").innerHTML = mealList;
}

async function showMealDetails(mealID) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`
  );
  const meal = data.meals[0];
  let ingredientsHTML = "";
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredientsHTML += `<li>${meal[`strIngredient${i}`]} - ${
        meal[`strMeasure${i}`]
      }</li>`;
    }
  }
  const mealDetailsHTML = `
        <div class="meal-details">
            <h2 class="text-center">${meal.strMeal}</h2>
            <div class="row">
                <div class="col-md-4">
                    <img src="${meal.strMealThumb}" alt="${
    meal.strMeal
  }" class="img-fluid">
                </div>
                <div class="col-md-8">
                    <p>${meal.strInstructions}</p>
                    <p class="fw-bold">Area: ${meal.strArea}</p>
                    <p class="fw-bold">Category: ${meal.strCategory}</p>
                    <div class="receipes">
                        <p class="fw-bold">Ingredients: </p>
                        <ul>
                            ${ingredientsHTML}
                        </ul>
                    </div>
                                            <strong>Tags:</strong>
                    <div class="tags">
                        ${
                          meal.strTags
                            ? meal.strTags
                                .split(",")
                                .map((tag) => `<span class="tag">${tag}</span>`)
                                .join(" ")
                            : ""
                        }
                    </div>
                    <div class="buttons mt-3">
                        ${
                          meal.strSource
                            ? `<a href="${meal.strSource}" target="_blank" class="btn btn-success source-btn">Source</a>`
                            : ""
                        }
                        ${
                          meal.strYoutube
                            ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger youtube-btn">YouTube</a>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
  document.querySelector("#content").innerHTML = mealDetailsHTML;
}
async function getAreas() {
  const data = await fetchData(
    "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
  );
  displayAreas(data.meals);
}

function displayAreas(areas) {
  console.log(areas);
  let areaList = ``;
  for (let i = 0; i < areas.length; i++) {
    areaList += `<div class="col-md-3">
    <div class="item my-4" onclick="showAreaMeals('${areas[i].strArea}')">
        <div class="text-white">
            <div class="text-container d-flex flex-column justify-content-center align-items-center">
                <i class="fa-solid fa-house-laptop text-white fs-1"></i>
                <h2>${areas[i].strArea}</h2>
            </div>
        </div>
    </div>
</div>`;
  }
  document.querySelector("#content").innerHTML = areaList;
}

async function showAreaMeals(areaName) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaName}`
  );
  displayMeals(data.meals);
}
async function getIngredientsPage() {
  const data = await fetchData(
    "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
  );
  displayIngredients(data.meals.slice(0, 20));
}

function displayIngredients(ingredients) {
  let ingredientList = ``;
  for (let i = 0; i < ingredients.length; i++) {
    ingredientList += `
        <div class="col-md-3">
                <div onclick="showIngredientMeals('${
                  ingredients[i].strIngredient
                }')" class="rounded-2 text-center cursor-pointer">
                        <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                        <h3>${ingredients[i].strIngredient}</h3>
                        <p>${ingredients[i].strDescription
                          .split(" ")
                          .slice(0, 20)
                          .join(" ")}</p>
                </div>
        </div>
        `;
  }
  document.querySelector("#content").innerHTML = ingredientList;
}

async function showIngredientMeals(ingredientName) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientName}`
  );
  displayMeals(data.meals);
}

function showContacts() {
  content.innerHTML = `
    <div class="contact min-vh-100 d-flex justify-content-center align-items-center">
        <div class="container w-75 text-center">
            <form id="contactForm">
                <div class="row g-4">
                    <div class="col-md-6 position-relative">
                        <input id="nameInput" type="text" class="form-control" placeholder="Enter Your Name">
                        <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Special characters and numbers not allowed
                        </div>
                    </div>
                    <div class="col-md-6 position-relative">
                        <input id="emailInput" type="email" class="form-control" placeholder="Enter Your Email">
                        <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Email not valid *example@yyy.zzz
                        </div>
                    </div>
                    <div class="col-md-6 position-relative">
                        <input id="phoneInput" type="text" class="form-control" placeholder="Enter Your Phone">
                        <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Enter valid Phone Number
                        </div>
                    </div>
                    <div class="col-md-6 position-relative">
                        <input id="ageInput" type="number" class="form-control" placeholder="Enter Your Age">
                        <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Enter valid age
                        </div>
                    </div>
                    <div class="col-md-6 position-relative">
                        <input id="passwordInput" type="password" class="form-control" placeholder="Enter Your Password">
                        <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Enter valid password *Minimum eight characters, at least one letter and one number:*
                        </div>
                    </div>
                    <div class="col-md-6 position-relative">
                        <input id="repasswordInput" type="password" class="form-control" placeholder="Re-enter Password">
                        <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
                            Passwords do not match
                        </div>
                    </div>
                </div>
                <div id="existAlert" class="alert alert-danger w-100 mt-2 d-none">
                    User already exists
                </div>
                <div id="successAlert" class="alert alert-success w-100 mt-2 d-none">
                    We have sent your request to our team
                </div>
                <button id="submitBtn" class="btn btn-outline-danger px-2 mt-3" type="button" onclick="submitForm()">Submit</button>
            </form>
        </div>
    </div>
  `;

  // Add event listeners for input fields
  document
    .getElementById("nameInput")
    .addEventListener("input", () =>
      validateInputData(
        /^[a-zA-Z\s]{2,}$/,
        document.getElementById("nameInput"),
        "nameAlert"
      )
    );
  document
    .getElementById("emailInput")
    .addEventListener("input", () =>
      validateInputData(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        document.getElementById("emailInput"),
        "emailAlert"
      )
    );
  document
    .getElementById("phoneInput")
    .addEventListener("input", () =>
      validateInputData(
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        document.getElementById("phoneInput"),
        "phoneAlert"
      )
    );
  document
    .getElementById("ageInput")
    .addEventListener("input", () =>
      validateInputData(
        /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/,
        document.getElementById("ageInput"),
        "ageAlert"
      )
    );
  document
    .getElementById("passwordInput")
    .addEventListener("input", () =>
      validateInputData(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        document.getElementById("passwordInput"),
        "passwordAlert"
      )
    );
  document
    .getElementById("repasswordInput")
    .addEventListener("input", () => repasswordValidation());
}

function validateInput(isValid, alertId, inputId) {
  const alertElem = document.getElementById(alertId);
  const inputElem = document.getElementById(inputId);
  alertElem.classList.toggle("d-block", !isValid);
  alertElem.classList.toggle("d-none", isValid);
  inputElem.classList.toggle("is-invalid", !isValid);
  inputElem.classList.toggle("is-valid", isValid);
  return isValid;
}

function validateInputData(pattern, inputElem, alertElem) {
  const isValid = pattern.test(inputElem.value);
  return validateInput(isValid, alertElem, inputElem.id);
}

function checkInputValidity() {
  const nameValid = validateInputData(
    /^[a-zA-Z\s]{2,}$/,
    document.getElementById("nameInput"),
    "nameAlert"
  );
  const emailValid = validateInputData(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    document.getElementById("emailInput"),
    "emailAlert"
  );
  const phoneValid = validateInputData(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    document.getElementById("phoneInput"),
    "phoneAlert"
  );
  const ageValid = validateInputData(
    /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/,
    document.getElementById("ageInput"),
    "ageAlert"
  );
  const passwordValid = validateInputData(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    document.getElementById("passwordInput"),
    "passwordAlert"
  );
  const repasswordValid = repasswordValidation();

  return (
    nameValid &&
    emailValid &&
    phoneValid &&
    ageValid &&
    passwordValid &&
    repasswordValid
  );
}

function repasswordValidation() {
  const password = document.getElementById("passwordInput").value;
  const repassword = document.getElementById("repasswordInput").value;
  const isValid = password === repassword;
  validateInput(isValid, "repasswordAlert", "repasswordInput");
  return isValid;
}

function submitForm() {
  const isValid = checkInputValidity();
  const submitBtn = document.getElementById("submitBtn");
  if (isValid) {
    document.getElementById("successAlert").classList.remove("d-none");
    document.getElementById("successAlert").classList.add("d-block");
    submitBtn.classList.add("bg-success");
  } else {
    document.getElementById("successAlert").classList.add("d-none");
    document.getElementById("successAlert").classList.remove("d-block");
    submitBtn.classList.remove("bg-success");
  }
}
