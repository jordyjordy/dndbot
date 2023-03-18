import SSEManager from './SSeManager';
import SSeManager from './SSeManager';

const mockCallback = jest.fn(x => x);

describe('SSE Manager tests', () => {
    it("Adds a server to the list when none exist", () => {
        SSeManager.addListener('a', 'b', mockCallback);
        expect(SSeManager.serverList).toHaveProperty('a');
    });

    it('calls the callback when needed', () => {
        SSeManager.addListener('a', 'b', mockCallback);
        expect(SSeManager.serverList).toHaveProperty('a');
        SSeManager.publish('a', 'x');
        expect(mockCallback).toHaveBeenCalledWith('x');
    });

    it('removes the the callback when needed', () => {
        SSeManager.addListener('a', 'b', mockCallback);
        expect(SSeManager.serverList).toHaveProperty('a');
        SSeManager.removeListener('a', 'b');
        SSEManager.publish('a', 'x');
        expect(mockCallback).toHaveBeenCalledTimes(0);
    });
});

beforeEach(() => {
    SSeManager.serverList = {};
    jest.clearAllMocks();
});