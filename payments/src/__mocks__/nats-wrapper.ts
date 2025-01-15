export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation((ubject: string, data: string, callback: () => void) => {
            callback();
        })
    }
}