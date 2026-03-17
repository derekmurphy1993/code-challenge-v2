import React, { useEffect, useRef, useState } from "react";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson";

function YearSelect({ filterVal, setFilterVal }) {
	// Filter by the permit issue year for each restaurant
	const startYear = 2026;
	const years = [...Array(11).keys()].map((increment) => {
		return startYear - increment;
	});
	const options = years.map((year) => {
		return (
			<option value={year} key={year}>
				{year}
			</option>
		);
	});

	return (
		<>
			<label htmlFor="yearSelect" className="fs-3">
				Filter by year:{" "}
			</label>
			<select
				id="yearSelect"
				className="form-select form-select-lg mb-3"
				value={filterVal}
				onChange={(e) => setFilterVal(Number(e.target.value))}
			>
				{options}
			</select>
		</>
	);
}
// handle no data years / no data area?
export default function RestaurantPermitMap() {
	const selectedLayerRef = useRef(null);

	const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"];

	const [currentYearData, setCurrentYearData] = useState([]);
	const [year, setYear] = useState(2026);
	const [isLoading, setIsLoading] = useState(false);

	const yearlyDataEndpoint = `/map-data/?year=${year}`;

	useEffect(() => {
		const controller = new AbortController();
		selectedLayerRef.current = null;
		setIsLoading(true);

		fetch(yearlyDataEndpoint, { signal: controller.signal })
			.then((res) => res.json())
			.then((data) => {
				setCurrentYearData(data);
			})
			.catch((error) => {
				if (error.name !== "AbortError") {
					console.error("Failed to fetch map data", error);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			});

		return () => {
			controller.abort();
		};
	}, [yearlyDataEndpoint]);

	const permitsByName = Object.fromEntries(
		currentYearData.map((area) => [area.name.trim().toUpperCase(), area.num_permits]),
	);

	function getColor(percentageOfPermits) {
		// potential next step: dynamically setting into yearly quartiles?
		if (percentageOfPermits <= 0) return communityAreaColors[0];
		if (percentageOfPermits <= 2) return communityAreaColors[1];
		if (percentageOfPermits <= 4) return communityAreaColors[2];
		return communityAreaColors[3];
	}

	function setAreaInteraction(feature, layer) {
		const name = feature.properties.community.trim().toUpperCase();
		const permits = permitsByName[name] || 0;
		const percentage = totalPermits > 0 ? (permits / totalPermits) * 100 : 0;

		const layerStyle = {
			fillColor: getColor(percentage),
			fillOpacity: 0.7,
			stroke: true,
			color: "#333",
			weight: 1,
		};

		const selectedStyle = {
			...layerStyle,
			color: "#EF3B2C",
			weight: 3,
		};
		layer.baseStyle = layerStyle;
		layer.setStyle(layerStyle);

		layer.bindTooltip(`<strong> ${name} </strong>: ${permits} new permits`);

		// Next step: handling of message handling in the popup (e.g. "1 new permit", "0% of 2026 permits")
		// Potential next step: getting type of permit data and including that breakdown in the popup
		layer.bindPopup(
			`<div style="text-align:center;"><strong> ${name}: </strong> <br /> ${permits ? `${permits} new permits` : "No new permits"} <br /> ${percentage.toFixed(2)}% of ${year} permits. </div>`,
		);

		layer.on("popupopen", () => {
			layer.setStyle(selectedStyle);
			layer.bringToFront();
		});

		layer.on("popupclose", () => {
			layer.setStyle(layerStyle);
			if (selectedLayerRef.current === layer) {
				selectedLayerRef.current = null;
			}
		});

		layer.on("click", () => {
			if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
				selectedLayerRef.current.setStyle(selectedLayerRef.current.baseStyle);
			}

			layer.setStyle(selectedStyle);
			selectedLayerRef.current = layer;
			layer.openPopup();
		});
	}
	const totalPermits = currentYearData.reduce(
		(acc, area) => acc + (Number(area.num_permits) || 0),
		0,
	);
	const maxNumPermits = currentYearData.reduce(
		(max, area) => Math.max(max, Number(area.num_permits) || 0),
		0,
	);

	return (
		<>
			<YearSelect filterVal={year} setFilterVal={setYear} />
			{isLoading ? <p className="fs-5">Loading year {year} data...</p> : null}
			<p className="fs-4">Restaurant permits issued this year: {totalPermits}</p>
			<p className="fs-4">
				Maximum number of restaurant permits in a single area:
				{maxNumPermits}
			</p>
			<MapContainer
				id="restaurant-map"
				center={[41.88, -87.62]}
				zoom={10}
				scrollWheelZoom={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
				/>
				{currentYearData.length > 0 ? (
					<GeoJSON
						data={RAW_COMMUNITY_AREAS}
						onEachFeature={setAreaInteraction}
						key={`${year}-${totalPermits}`}
					/>
				) : null}
			</MapContainer>
		</>
	);
}
