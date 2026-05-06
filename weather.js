let tempChart, humidityChart, pressureChart, windChart, rainChart;

async function loadData() {
    const response = await fetch("/weather-data");
    const data = await response.json();

    if (!data || data.length === 0) {
        alert("No data yet!");
        return;
    }

    // 🔥 24-hour timeline (5 min interval)
    const labels = [];
    const temp = [];
    const humidity = [];
    const pressure = [];
    const wind = [];
    const rain = [];

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 0, 0);

    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + 5)) {
        labels.push(new Date(t));

        const match = data.find(d => {
            const dt = new Date(d.timestamp);
            return Math.abs(dt - t) < 2.5 * 60 * 1000;
        });

        temp.push(match ? match.temperature : null);
        humidity.push(match ? match.humidity : null);
        pressure.push(match ? match.pressure : null);
        wind.push(match ? match.wind_speed : null);
        rain.push(match ? match.rainfall : null);
    }

    // Destroy old charts
    if (tempChart) tempChart.destroy();
    if (humidityChart) humidityChart.destroy();
    if (pressureChart) pressureChart.destroy();
    if (windChart) windChart.destroy();
    if (rainChart) rainChart.destroy();

    // 🔥 CLEAN CHART OPTIONS
    const commonOptions = {
        responsive: true,
        layout: {
            padding: {
                left: 10,
                right: 20,
                top: 10,
                bottom: 10
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 12,

                    callback: function(value) {
                        const date = new Date(this.getLabelForValue(value));

                        // show only full hours
                        if (date.getMinutes() === 0) {
                            return date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        }
                        return '';
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                },
                beginAtZero: false
            }
        },
        plugins: {
            legend: {
                display: true
            }
        }
    };

    // 🔥 DATASET STYLE
    const createDataset = (label, data) => ({
        label,
        data,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        spanGaps: true
    });

    // Charts
    tempChart = new Chart(document.getElementById("temp"), {
        type: "line",
        data: { labels, datasets: [createDataset("Temperature (°C)", temp)] },
        options: commonOptions
    });

    humidityChart = new Chart(document.getElementById("humidity"), {
        type: "line",
        data: { labels, datasets: [createDataset("Humidity (%)", humidity)] },
        options: commonOptions
    });

    pressureChart = new Chart(document.getElementById("pressure"), {
        type: "line",
        data: { labels, datasets: [createDataset("Pressure (hPa)", pressure)] },
        options: commonOptions
    });

    windChart = new Chart(document.getElementById("wind"), {
        type: "line",
        data: { labels, datasets: [createDataset("Wind Speed", wind)] },
        options: commonOptions
    });

    rainChart = new Chart(document.getElementById("rain"), {
        type: "line",
        data: { labels, datasets: [createDataset("Rainfall (mm)", rain)] },
        options: commonOptions
    });
}

// Auto load + refresh
window.onload = loadData;
setInterval(loadData, 60000);

function goHome() {
    window.location.href = "/";
}