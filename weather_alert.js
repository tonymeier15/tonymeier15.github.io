function formatDateForAlert(dateString, headline) {
    const date = new Date(dateString); //Date object in ISO 8601 string format "2025-02-20T10:00:00-06:00" [YEAR]-[MONTH]-[DAY]-[TIME]-[TIMEZONE OFFSET]
    const timezoneOffset = dateString.slice(-6); // Get the last 6 characters "-06:00" UTC offset timezone
    let timezoneName = '';
    let timezoneAbbreviation = '';
    
    const timeZonePattern = /\b(?:[A-Z]{3,4})\b/g; // Regex to match time zone abbreviations (e.g., CDT, EST, etc.)
    const match = headline.match(timeZonePattern);
    
    if (match) {
        timezoneAbbreviation = match[0];
        console.log(match);
    } 

    if (timezoneAbbreviation === 'CST' || timezoneAbbreviation === 'CDT') {
        timezoneName = "America/Chicago"; // Central Standard Time or Central Daylight Time
    } else if (timezoneAbbreviation === 'EST' || timezoneAbbreviation === 'EDT') {
        timezoneName = "America/New_York"; // Eastern Standard Time or Eastern Daylight Time
    } else if (timezoneAbbreviation === 'MST' || timezoneAbbreviation === 'MDT') {
        timezoneName = "America/Denver"; // Mountain Standard Time or Mountain Daylight Time
    } else if (timezoneAbbreviation === 'PST' || timezoneAbbreviation === 'PDT') {
        timezoneName = "America/Los_Angeles"; // Pacific Standard Time or Pacific Daylight Time
    } else if (timezoneAbbreviation === 'AKST' || timezoneAbbreviation === 'AKDT') {
        timezoneName = "America/Anchorage"; // Alaska Standard Time or Alaska Daylight Time
    } else if (timezoneAbbreviation === 'HST') {
        timezoneName = "Pacific/Honolulu"; // Hawaii Standard Time (no DST)
    } else if (timezoneAbbreviation === 'AST' || timezoneAbbreviation === 'ADT') {
        timezoneName = "America/Halifax"; // Atlantic Standard Time or Atlantic Daylight Time
    } else if (timezoneAbbreviation === 'ChST') {
        timezoneName = "Pacific/Guam"; // Chamorro Standard Time (Guam)
    } else if (timezoneAbbreviation === 'SST') {
        timezoneName = "Pacific/Apia"; // Samoa Standard Time (American Samoa)
    } else if (timezoneAbbreviation === 'UTC') {
        timezoneName = "UTC"; // Coordinated Universal Time (no DST)
    } else if (timezoneAbbreviation === 'WET' || timezoneAbbreviation === 'WEST') {
        timezoneName = "Europe/Lisbon"; // Western European Time (WET) or Western European Summer Time (WEST)
    } else if (timezoneAbbreviation === 'CET' || timezoneAbbreviation === 'CEST') {
        timezoneName = "Europe/Berlin"; // Central European Time (CET) or Central European Summer Time (CEST)
    } else if (timezoneAbbreviation === 'BST') {
        timezoneName = "Europe/London"; // British Standard Time (BST, used in the UK during DST)
    } else {
        timezoneName = `UTC${timezoneOffset}`; // Generic fallback for other time zones
    }

    // Use Intl.DateTimeFormat to convert the date to the target timezone
    const options = { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true, 
        weekday: 'short', 
        timeZone: timezoneName
    };

    const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date);

    // Get the day abbreviation and remove the weekday format from the final time
    const dayAbbreviation = formattedTime.slice(0, 3).toUpperCase();
    const time = formattedTime.slice(4);  // Remove day abbreviation from time

    // Construct the output string
    return `${time} ${timezoneAbbreviation} ${dayAbbreviation}`;
}

const weather_alert_container_information = document.getElementById("weather_alert_container_information");
const weather_alert_container_location = document.getElementById("weather_alert_container_location");
const weather_alert_container = document.getElementById("weather_alert_container");

async function getWeatherAlerts(lat, lon) {
    try {
        const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`);
        const data = await response.json();
        console.log(data);

        if (data.features && data.features.length > 0) {
            data.features.forEach(alert => {
                console.log(alert);
                const severity = alert.properties.severity; //SEVERE (RED) / MODERATE (ORANGE) ebbb02, e6731f
                const end_Time = formatDateForAlert(alert.properties.ends, alert.properties.headline); //NOW UNTIL THU 10:00 AM EST
                const event = alert.properties.event.toUpperCase(); //COLD WEATHER ADVISORY or WINTER STORM WARNING

                const alert_information_top_container = document.createElement("div");
                alert_information_top_container.className = "alert_information_top_container";
                const storm_Information = document.createElement("div");
                storm_Information.className = "storm_Information_Card"
                const alert_Event = document.createElement("h2");
                const alert_End_Time = document.createElement("p");
                alert_End_Time.innerHTML = `${end_Time}`;
                alert_Event.innerHTML = `<b>${event}</b>`;

                alert_Event.style.cssText = 'user-select: none; padding-bottom: 5px;';
                alert_End_Time.style.cssText = 'user-select: none;';

                if (severity == "Severe" || severity == "Extreme") {
                    alert_information_top_container.style.cssText += `
                        background-color: #9d0b00;
                    `;
                } else if (severity == "Moderate") {
                    alert_information_top_container.style.cssText += `
                        background-color: #be5000;
                    `;
                } else if (severity == "Minor") {
                    alert_information_top_container.style.cssText += `
                        background-color: #c29c01;
                    `;
                }

                alert_information_top_container.appendChild(alert_Event);
                alert_information_top_container.appendChild(alert_End_Time);

                const sender_Name = alert.properties.senderName;
                const alertDiv = document.createElement("div");
                alertDiv.className = "alert";
                alertDiv.innerHTML = 
                    `
                    <h4>Action Recommended</h4>
                    <div>Make preparations per the instruction.</div>

                    <h4>Issued By</h4>
                    <div>${alert.properties.senderName.replace("NWS", "National Weather Service,")}</div>

                    <h4>Affected Area</h4>
                    <div>${alert.properties.areaDesc}</div>

                    <h4>Description</h4>
                    ${alert.properties.parameters.NWSheadline && alert.properties.parameters.NWSheadline.length > 0 ? 
                        `<div>${alert.properties.parameters.NWSheadline[0]}</div> <br>` 
                        : ''
                    }
                    <div id="alert_description">${alert.properties.description}</div>
                    
                    ${alert.properties.instruction ? 
                        `<h4>PRECAUTIONARY/PREPARDNESS ACTIONS</h4>
                        <div>${alert.properties.instruction}</div>` 
                        : ''
                    }
                `;

                alert_information_top_container.addEventListener("click", function(){
                    this.classList.toggle("no-radius");
                    alertDiv.classList.toggle("hidden");
                });

                storm_Information.appendChild(alert_information_top_container);
                storm_Information.appendChild(alertDiv);
                weather_alert_container_information.appendChild(storm_Information);
                weather_alert_container.classList = "";
            });
            console.log("Active weather alerts:", data.features);
        } else {
            console.log("No active alerts for this location.");
        }
    } catch (error) {
        console.error("Error fetching weather alerts:", error);
    }
}

async function getWeatherByZIP(zip) {
    try {
        const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
        const data = await response.json();
        console.log(data);

        if (data.places && data.places.length > 0) {
            getWeatherAlerts(data.places[0]["latitude"], data.places[0]["longitude"]);
            weather_alert_container_location.innerHTML = `${data.places[0]["place name"]}, ${data.places[0]["state abbreviation"]}`;
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

getWeatherByZIP(82225);
