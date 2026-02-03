document.addEventListener("DOMContentLoaded", function () {
  let updateZmanimFlag = true;

  function getWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));
    const options = { month: "long", day: "numeric" };
    return `Sunday, ${sunday.toLocaleDateString("en-US", options)} - Shabbos, ${saturday.toLocaleDateString("en-US", options)}`;
  }

  function setWeekRange() {
    const weekRangeElement = document.getElementById("weekRange");
    if (weekRangeElement) {
      weekRangeElement.textContent = getWeekRange();
    }
  }

  function getTodayDate() {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return today.toLocaleDateString("en-US", options);
  }

  function setTodayDate() {
    const todayDateElement = document.getElementById("getTodayDate");
    if (todayDateElement) {
      todayDateElement.textContent = getTodayDate();
    }
  }

  function convertTo12HourFormat(timeStr) {
    if (!timeStr || timeStr.toLowerCase() === "n/a") return "N/A";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const convertedHours = hours % 12 || 12;
    return `${convertedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  function subtractMinutes(timeStr, minutesToSubtract) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes - minutesToSubtract, 0, 0);
    return convertTo12HourFormat(
      `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );
  }

  function isBetweenPesachAndSuccos(hebrewDateStr = "") {
    const lower = hebrewDateStr.toLowerCase();
    return [
      "nisan",
      "iyar",
      "sivan",
      "tammuz",
      "av",
      "elul",
      "tishrei"
    ].some(month => lower.includes(month));
  }

  async function fetchScheduleItems() {
    if (!updateZmanimFlag) return;

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    const dayOfWeek = today.getDay();

    // ✅ SAME-ORIGIN CALL (NO CORS)
    const apiUrl = `/api/zmanim/today?date=${todayDate}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const json = await response.json();

      if (json.status === "success" && json.data.length > 0) {
        const zmanim = json.data[0];

        const zmanimMapping = {
          hebrewDate: zmanim.hebrew_day,
          earlyMorningShacharis: convertTo12HourFormat(zmanim.bais_base_first_shachrit_time),
          morningShacharis: convertTo12HourFormat(zmanim.bais_second_shachrit_time),
          earlyMincha: dayOfWeek === 0 ? convertTo12HourFormat(zmanim.bais_early_mincha_time) : null,
          weekdayMinchaMaariv: convertTo12HourFormat(zmanim.bais_reg_mincha_time),
          candleLighting: convertTo12HourFormat(zmanim.candle_lighting_time),
          parsha: zmanim.parsha,
          havdalah: convertTo12HourFormat(zmanim.havdala_time),
          fastStarts: convertTo12HourFormat(zmanim.zmanim_alos_bais),
          fastEnds: convertTo12HourFormat(zmanim.fast_ends),
          minchaErevShabbos: convertTo12HourFormat(zmanim.bais_reg_mincha_time),
          yomtovEnd: convertTo12HourFormat(zmanim.zmanim_tzeis_50)
        };

        Object.entries(zmanimMapping).forEach(([key, value]) => {
          const el = document.getElementById(key);
          if (el) el.textContent = value || "N/A";
        });

        const inSeason = isBetweenPesachAndSuccos(zmanim.hebrew_day);
        const isYomTov =
          zmanim.is_erev_yomtov ||
          zmanim.erev_yomtov ||
          zmanim.parsha?.toLowerCase().includes("yom");

        const earlyRow = document.getElementById("earlyCandleLightingRow");
        const earlySpan = document.getElementById("earlyCandleLighting");

        if (inSeason && !isYomTov && zmanim.zmanim_plag_hamincha_gra) {
          earlyRow.style.display = "block";
          earlySpan.textContent = convertTo12HourFormat(zmanim.zmanim_plag_hamincha_gra);
        } else {
          earlyRow.style.display = "none";
        }
      }
    } catch (error) {
      console.error("Error fetching zmanim data:", error);
    }
  }

  setTodayDate();
  setWeekRange();
  fetchScheduleItems();
});

/* ===========================
   SharePoint downloads
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button[data-folder]").forEach(button => {
    button.addEventListener("click", async () => {
      const folder = button.dataset.folder;
      const spinner = document.getElementById("spinner");
      if (spinner) spinner.style.display = "block";

      try {
        const response = await fetch(
          `/api/sharepoint/recent-file?folder=${encodeURIComponent(folder)}&t=${Date.now()}`
        );

        if (!response.ok) throw new Error("File download failed.");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const disposition = response.headers.get("Content-Disposition");
        let fileName = `${folder}_File.pdf`;
        if (disposition?.includes("filename=")) {
          fileName = disposition.split("filename=")[1].replace(/"/g, "");
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("Failed to download file from folder: " + folder);
      } finally {
        if (spinner) spinner.style.display = "none";
      }
    });
  });
});
