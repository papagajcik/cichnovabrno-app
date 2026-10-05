// shared/calendar.js
// Kalendář s podporou probíhajících akcí a celodenních událostí

const TEAMUP_API_KEY = '4338bc585ba8c2ca24980982ad31b6121467e46650ed36c9acd3ec07f78dc87f';
const TEAMUP_CALENDAR_ID = 'ks8dj7yj9dknc72wca';

async function fetchCalendarEvents(startOffsetDays = -7, endOffsetDays = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startOffsetDays);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + endOffsetDays);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const url = `https://api.teamup.com/${TEAMUP_CALENDAR_ID}/events?startDate=${startStr}&endDate=${endStr}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Teamup-Token': TEAMUP_API_KEY }
        });
        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error('Chyba načítání kalendáře:', error);
        return [];
    }
}

function isEventOngoingOnDate(event, date) {
    const start = new Date(event.start_dt);
    const end = new Date(event.end_dt);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    
    return targetDate >= startDate && targetDate <= endDate;
}

function isAllDayEvent(event) {
    const start = new Date(event.start_dt);
    const end = new Date(event.end_dt);
    const durationMs = end - start;
    // Akce je celodenní pokud trvá 23+ hodin a začíná o půlnoci
    return durationMs >= 82800000 && start.getHours() === 0 && start.getMinutes() === 0;
}

function formatEventTime(event, isOngoing = false) {
    if (isAllDayEvent(event)) {
        return '<span class="all-day-badge"><i class="fas fa-sun"></i> Celodenní</span>';
    }
    
    const start = new Date(event.start_dt);
    const end = new Date(event.end_dt);
    const now = new Date();
    
    if (isOngoing && start <= now && end >= now) {
        const endTime = end.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
        return `<span class="ongoing-badge"><i class="fas fa-play"></i> Probíhá do ${endTime}</span>`;
    }
    
    const time = start.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    return `<span class="time-badge">${time}</span>`;
}

async function loadCalendarForTv(tvId, containerId) {
    const events = await fetchCalendarEvents();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = [];
    const tomorrowEvents = [];
    
    events.forEach(event => {
        const isToday = isEventOngoingOnDate(event, today);
        const isTomorrow = isEventOngoingOnDate(event, tomorrow);
        
        if (isToday) {
            todayEvents.push({
                ...event,
                isOngoing: new Date(event.start_dt) <= today && new Date(event.end_dt) >= today
            });
        }
        if (isTomorrow) {
            tomorrowEvents.push(event);
        }
    });
    
    renderCalendarEvents(todayEvents, tomorrowEvents, containerId);
}

function renderCalendarEvents(todayEvents, tomorrowEvents, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const todayHtml = todayEvents.map(event => `
        <div class="event-item ${event.isOngoing ? 'ongoing' : ''}">
            ${formatEventTime(event, event.isOngoing)}
            <div class="event-details">
                <h4>${escapeHtml(event.title)}</h4>
                ${event.location ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    const tomorrowHtml = tomorrowEvents.map(event => `
        <div class="event-item">
            ${formatEventTime(event)}
            <div class="event-details">
                <h4>${escapeHtml(event.title)}</h4>
                ${event.location ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="calendar-today">
            <h3><i class="fas fa-sun"></i> Dnes</h3>
            <div class="events-list">${todayEvents.length ? todayHtml : '<p class="no-events">Žádné akce</p>'}</div>
        </div>
        <div class="calendar-tomorrow">
            <h3><i class="fas fa-clock"></i> Zítra</h3>
            <div class="events-list">${tomorrowEvents.length ? tomorrowHtml : '<p class="no-events">Žádné akce</p>'}</div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.loadCalendarForTv = loadCalendarForTv;