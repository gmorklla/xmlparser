const regex = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}).{2}(.+)$/;

module.exports = {
    format: (str) => {
        const format = str.replace(regex, (n, year, month, day, hour, minutes, seconds, zone) => year + '-' + month + '-' + day + ' ');
        const date = new Date(format);
        return date;
    },
    getTick: (str) => {
        const pieces = str.match(regex);
        const hours = Number(pieces[4]);
        const minutes = Number(pieces[5]);
        const tick = hours.toString() + '.' + minutes.toString();
        return tick;
    },
    getDateData: (str, type) => {
        const pieces = str.match(regex);
        const obj = {
            year: pieces[1],
            month: pieces[2],
            day: pieces[3],
            hour: pieces[4],
            minutes: pieces[5]
        };
        switch (type) {
            case 'year':
                return obj.year;
            case 'month':
                return obj.month;
            case 'day':
                return obj.day;
            case 'hour':
                return obj.hour;
            case 'minutes':
                return obj.minutes;
            default:
                return obj;
        }
    }
}
