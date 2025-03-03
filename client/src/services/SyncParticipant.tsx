import EventEmitter from "eventemitter3";
import {
  filter,
  find,
  indexOf,
  isEqual,
  map,
  min,
  now,
  sortBy,
  throttle,
  uniq,
} from "lodash-es";
import sysend from "sysend";

export const instance = sysend.id;

export const age = now();

export const minimal = !!new URLSearchParams(location.search).get("minimal");
export const channel =
  new URLSearchParams(location.search).get("channel") || instance;
export const page = new URLSearchParams(location.search).get("page") || "";

export const rpc = sysend.rpc({
  channel() {
    return channel;
  },
  age() {
    return `${age}`;
  },
});

type State = {
  loading: boolean;
  isPrimary: boolean;
  isOnly: boolean;
  participants: string[];
  peers: string[];
  index: number;
};

export class SyncParticipant extends EventEmitter<"sync"> {
  current: State = {
    loading: true,
    isPrimary: true,
    isOnly: true,
    participants: [],
    peers: [],
    index: 0,
  };
  constructor() {
    super();
    const checkChannels = throttle(async () => {
      // TODO: Fix subtle race condition issues
      const getChannel = async (peer: string) => {
        if (peer !== instance) {
          try {
            const tunnel = await rpc;
            const peerChannel = await tunnel.channel(peer);
            const peerAge = parseInt(await tunnel.age(peer));
            return {
              channel: peerChannel,
              id: peer,
              age: peerAge,
            };
          } catch (e) {
            console.warn(e);
          }
        }
      };
      const peers = filter(
        await Promise.all(map(await sysend.list(), (p) => getChannel(p.id)))
      );
      const participants = filter(peers, { channel });
      const channels = sortBy(
        uniq([channel, ...map(peers, "channel")]),
        (id) => find(peers, { id })?.age ?? age
      );
      const new2 = {
        loading: false,
        isPrimary: !participants.length || age < min(map(participants, "age")),
        isOnly: !participants.length,
        participants: map(participants, "id"),
        peers: map(peers, "id"),
        index: indexOf(channels, channel),
      };
      if (!isEqual(new2, this.current)) {
        this.current = new2;
        this.emit("sync", this.current);
      }
    }, 300);
    sysend.track("open", checkChannels);
    sysend.track("close", checkChannels);
  }
}

export const participant = new SyncParticipant();
