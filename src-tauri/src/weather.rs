use crate::types::{WeatherCurrent, WeatherData, WeatherForecastDay};


const WEATHER_API_KEY: &str = "4ef5a235a37d4e8aab7220524263008";

use serde::Deserialize;

const WEATHER_API_URL: &str = "https://api.weatherapi.com/v1/forecast.json";

#[derive(Debug, Deserialize)]
struct WeatherApiResponse {
    current: ApiCurrent,
    forecast: ApiForecast,
}

#[derive(Debug, Deserialize)]
struct ApiCurrent {
    temp_c: f64,
    feelslike_c: f64,
    condition: ApiCondition,
    wind_kph: f64,
}

#[derive(Debug, Deserialize)]
struct ApiForecast {
    forecastday: Vec<ApiForecastDay>,
}

#[derive(Debug, Deserialize)]
struct ApiForecastDay {
    date: String,
    day: ApiDay,
    astro: ApiAstro,
}

#[derive(Debug, Deserialize)]
struct ApiDay {
    maxtemp_c: f64,
    mintemp_c: f64,
    condition: ApiCondition,
    daily_chance_of_rain: f64,
}

#[derive(Debug, Deserialize)]
struct ApiAstro {
    sunrise: String,
    sunset: String,
}

#[derive(Debug, Deserialize)]
struct ApiCondition {
    text: String,
    icon: String,
}

#[tauri::command]
pub async fn get_weather() -> Result<WeatherData, String> {
    println!("get_weather: requesting weather via auto:ip");
    let client = reqwest::Client::new();

    let response = client
        .get(WEATHER_API_URL)
        .query(&[
            ("key", WEATHER_API_KEY.to_string()),
            ("q", "auto:ip".to_string()),
            ("days", "14".to_string()),
        ])
        .send()
        .await
        .map_err(|e| {
            println!("get_weather: Weather API request failed: {}", e);
            format!("Weather API request failed: {}", e)
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();

        println!("get_weather: Weather API returned {}: {}", status, body);

        return Err(format!(
            "Weather API returned {}: {}",
            status, body
        ));
    }

    let api_data: WeatherApiResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse weather response: {}", e))?;

    let current = WeatherCurrent {
        temperature: Some(api_data.current.temp_c),
        feels_like: Some(api_data.current.feelslike_c),
        high: api_data
            .forecast
            .forecastday
            .first()
            .map(|day| day.day.maxtemp_c),
        low: api_data
            .forecast
            .forecastday
            .first()
            .map(|day| day.day.mintemp_c),
        description: Some(api_data.current.condition.text),
        rain_probability: api_data
            .forecast
            .forecastday
            .first()
            .map(|day| day.day.daily_chance_of_rain),
        wind_speed: Some(api_data.current.wind_kph),
        sunrise: api_data
            .forecast
            .forecastday
            .first()
            .map(|day| day.astro.sunrise.clone()),
        sunset: api_data
            .forecast
            .forecastday
            .first()
            .map(|day| day.astro.sunset.clone()),
        icon: Some(api_data.current.condition.icon),
    };

    let forecast = api_data
        .forecast
        .forecastday
        .into_iter()
        .map(|day| WeatherForecastDay {
            date: day.date,
            high: Some(day.day.maxtemp_c),
            low: Some(day.day.mintemp_c),
            description: Some(day.day.condition.text),
            rain_probability: Some(day.day.daily_chance_of_rain),
            icon: Some(day.day.condition.icon),
        })
        .collect();

    Ok(WeatherData {
        current,
        forecast,
    })
}
