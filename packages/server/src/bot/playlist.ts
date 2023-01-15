
export type Song = {
    _id?: string
    url:string,
    name:string
};

export type Queue = Song[];

export default class playlist {
    _id: string;
    name: string;
    server: string;
    queue:Queue;

    constructor({ _id, name, server, queue = [] }: { _id: string, name: string, server: string, queue: Queue}) {
        this._id = _id;
        this.name = name;
        this.server = server;
        this.queue = queue;
    }

    removeSong(id:number):void {
        this.queue.splice(id,1);
    }

    clearQueue(): void {
        this.queue = [];
    }

    getSong(id:number): Song {
        return this.queue[id];
    }
    
    getSongUrl(id: number): string | undefined {
        return this.queue[id]?.url;
    }

    insertSong(song:Song, pos:number = this.queue.length):void {
        this.queue.splice(pos, 0, song);
    }
}