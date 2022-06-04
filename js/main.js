import { weatherKey, stockKey, newsKey } from "./config.js";


const setDate = async () => {
    const dateBox = document.querySelector(".date-box");

    //https://www.freecodecamp.org/news/how-to-format-dates-in-javascript/
    const date = new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});

    dateBox.innerHTML = `<p class="date-text">${date}</p><p class="todays-paper">Todays Paper</p>`;
};


const setMarket = async () => {
    const marketRow = document.querySelector(".market-row");

    //marketRow.innerHTML = `<p class="stock-item">All Ords +1.03%</p>`
    //MAX 100 requests per day

        //yahoo finance api
    const stockResponse = await fetch(`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=%5EAORD%2C%5EAXJO%2CAUDUSD%3DX%2CBTC-AUD`,{
        method: "GET",
        headers: { 'x-api-key': stockKey},
    });

    const stockData = await stockResponse.json();
    //console.log(stockData);

    if(stockData.message){
        marketRow.innerHTML = `<p>Stock Data</p>`;
        
    }else{
        const AUMarketSummary = stockData.quoteResponse.result;


        let count = 0;
    
        setInterval(() => {
            let marketChange = AUMarketSummary[count].regularMarketChangePercent.toFixed(2);
    
            marketRow.innerHTML = `<p class="stock-text stock-name">${AUMarketSummary[count].shortName}</p> <p class="stock-text stock-change ${marketChange < 0.00 ? "stock-down" : "stock-up"}">${marketChange}%</p>`
    
            count === AUMarketSummary.length - 1 ? count = 0 : count++; 
            
        }, 3000);
    }

};


const setWeather = async () => {
    const weatherRow = document.querySelector(".weather-row");

    const coordResponse = await fetch(`https://ipapi.co/json/`);
    const coords = await coordResponse.json();
    const {latitude, longitude} = coords;

    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherKey}&units=metric`);
    const weatherData = await weatherResponse.json();
    const {main, weather} = weatherData;
    //http://openweathermap.org/img/wn/10d@2x.png
   // console.log(main, weather);

    const html = `
        <p title="Today's Weather: ${main.temp.toFixed(0)}°C and ${weather[0].main}"><img class="weather-icon" src="http://openweathermap.org/img/wn/${weather[0].icon}.png"/></p>
        <p class="weather-temp temp">${main.temp.toFixed(0)}°C</p>
        <p class="weather-temp-max temp">${main.temp_max.toFixed(0)}°</p>   
        <p class="weather-temp-min temp">${main.temp_min.toFixed(0)}°</p>   
    `;

    weatherRow.innerHTML = html;
};

export const setTopStories = async (category) => {
    setLoader(true);
    const newsResponse = await fetch(`https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=${newsKey}`);

    const newsData = await newsResponse.json();

    const topFive = document.querySelector(".top-five");
    const mainFeed = document.querySelector(".main-feed");
    const sideFeed = document.querySelector(".side-feed");

    if(category === "home"){

        newsData.results.forEach((article, index) => {
            
           if(index < 5){
            topFive.innerHTML += createArticleTemplate(article, index, "TOPFIVE");
           }else if(index < 25){
            mainFeed.innerHTML += createArticleTemplate(article, null, "MAINFEED");
           }else{ 
            sideFeed.innerHTML += createArticleTemplate(article, null, "SIDEFEED");
           }
        });

    }else{
        
        newsData.results.forEach((article, index) => {
            
            if(index < 15){
                mainFeed.innerHTML += createArticleTemplate(article, null, "MAINFEED");
            }else{
                sideFeed.innerHTML += createArticleTemplate(article, null, "SIDEFEED");
            }
            
         });
        
    }

    setTimeout(() => {
        setLoader(false);
    }, 3000);
};

const setLoader = (loadStatus) => {
    const loadScreen = document.querySelector(".loader-screen");
    
    if(loadStatus){
        loadScreen.classList.add("loader-screen-on");
    }else{
        loadScreen.classList.remove("loader-screen-on");
    }
}

const createArticleTemplate = (article, number, type) => {


    if(type === "TOPFIVE"){
        return `
        <a class="news-article article-${number + 1}" href=${article.url} style="background-image: url(${ article.multimedia ? article.multimedia[0].url : null})">
            <div class="news-article-text">
                <p class="news-article-category">${article.section}</p>
                <h3 class="news-article-title">${article.title}</h3>
            </div>
        </a>
        `;
    }

    if(type === "MAINFEED"){
        
        return `
        <a class="news-article bar-template-article" href=${article.url}>
            <div class="news-article-text">
                <h4 class="news-article-category">${article.section}</h4>
                <h3 class="news-article-title">${article.title}</h3>
                <p class="news-article-details">${article.abstract}</p>
                <p class="news-article-author">
                ${article.byline ? article.byline : "By Unknown"}
                </p>
            </div>
            <div class="news-article-img"><img src=${article.multimedia ? article.multimedia[0].url : "./images/image-unavailable.png"}><p class="news-article-img-copyright">${article.multimedia ? article.multimedia[0].copyright : "Unknown"}</p></div>
        </a>
        `;
    }

    if(type === "SIDEFEED"){
        return `
        <a class="news-article strip-template-article" href=${article.url}>
            <div class="news-article-text">
                <div class="news-article-author">
                    <span>${article.byline ? article.byline : "By Unknown"}</span>
                </div>
                <h3 class="news-article-title">${article.title}</h3>
            </div>
            <div class="news-article-img"><img src=${article.multimedia ? article.multimedia[0].url : "./images/image-unavailable.png"}><p class="news-article-img-copyright">${article.multimedia ? article.multimedia[0].copyright : "Unknown"}</p></div>
        </a>
        `;
    }

    if(type === "SEARCH"){
        return `
        <a class="news-article bar-template-article" href=${article.web_url}>
            <div class="news-article-text">
                <h4 class="news-article-category">${article.section_name}</h4>
                <h3 class="news-article-title">${article.headline.main}</h3>
                <p class="news-article-details">${article.abstract}</p>
                <p class="news-article-author">
                ${article.byline ? article.byline.original : "By Unknown"}
                </p>
            </div>
            <div class="news-article-img"><img src=${article.multimedia[0] ? ("https://www.nytimes.com/" + article.multimedia[0].url) : "./images/image-unavailable.png"}></div>
        </a>
        `;
    }
    
}


export const getSearchResults = async (query) => {
    
    const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${newsKey}`);

    const results = await response.json();

    const mainFeed = document.querySelector(".main-feed");

    results.response.docs.forEach((article, index) => {
        console.log(article);
        mainFeed.innerHTML += createArticleTemplate(article, null, "SEARCH");   
    });

}


const checkArticle = (article) => {

    if(article.title.length > 0) return true;
    
    return false;

}


const handleNavToggleClick = () => {
    const body = document.querySelector("body");
    body.classList.toggle("toggle-on");
};

const handleSearchToggleClick = (e) => {
    const searchForm = document.querySelector(".search-form");
    e.currentTarget.classList.toggle("form-open");
    searchForm.classList.toggle("search-form-display");
}

const attachEventHandlers = () => {
    
    const navToggle = document.querySelector(".nav-toggle");
    const searchToggle = document.querySelector(".search-toggle");

    navToggle.addEventListener("click", handleNavToggleClick);
    searchToggle.addEventListener("click", handleSearchToggleClick);
};



const init = () => {
  attachEventHandlers();
  setDate();
  setWeather();
  setMarket();
  
    window.addEventListener("scroll", function(){
        const body = document.querySelector("body");
        
        setInterval(() => {

            if(this.scrollY > 300){

                body.classList.add("scroll");
                
            }else{
                body.classList.remove("scroll");
            }


        },2000);
    })
};


document.addEventListener("DOMContentLoaded", init);