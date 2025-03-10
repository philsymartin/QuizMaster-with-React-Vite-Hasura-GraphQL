import { getTimeDifferenceFromNow } from "../../../components/utils/Helpers"

describe('getTimeDifferenceFromNow', () => {
    const fixedNow = new Date("2024-03-06T12:00:00Z");

    beforeAll(() => {
        // Mocks Date.now() to always return the fixed timestamp (fixedNow)
        jest.spyOn(global.Date, "now").mockImplementation(() => fixedNow.getTime());
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should return "just now" for less than 1 minute difference', () => {
        expect(getTimeDifferenceFromNow(new Date())).toBe('just now');
    });

    it('should return "1 minute ago" for exactly 1 minute difference', () => {
        const pastDate = new Date(fixedNow);
        pastDate.setMinutes(fixedNow.getMinutes() - 1);
        expect(getTimeDifferenceFromNow(pastDate)).toBe('1 minute ago');
    });

    it('should return "X minute ago" for less than 60 minutes difference', () => {

        const pastDate = new Date(fixedNow);
        pastDate.setMinutes(fixedNow.getMinutes() - 30);
        expect(getTimeDifferenceFromNow(pastDate)).toBe('30 minutes ago');
    });

    it('should return "1 hour ago" for exactly 1 hour difference', () => {
        const pastDate = new Date(fixedNow);
        pastDate.setHours(fixedNow.getHours() - 1);
        expect(getTimeDifferenceFromNow(pastDate)).toBe('1 hour ago');
    });

    it('should return "X hours ago" for less than 24 hours difference', () => {
        const pastDate = new Date(fixedNow);
        pastDate.setHours(fixedNow.getHours() - 5);
        expect(getTimeDifferenceFromNow(pastDate)).toBe('5 hours ago');
    });

    it('should return "1 day ago" for exactly 24 hours difference', () => {
        const pastDate = new Date(fixedNow);
        pastDate.setDate(fixedNow.getDate() - 1);
        expect(getTimeDifferenceFromNow(pastDate)).toBe('1 day ago');
    });

    it('should return "X days ago" for more than 1 day difference', () => {
        const pastDate = new Date(fixedNow);
        pastDate.setDate(fixedNow.getDate() - 3);
        expect(getTimeDifferenceFromNow(pastDate)).toBe('3 days ago');
    });

})