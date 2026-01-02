import { ObjectUtil, Base64 } from './utils';

// --- Constants ---
export const Protocols = {
    Freedom: "freedom",
    Blackhole: "blackhole",
    DNS: "dns",
    VMess: "vmess",
    VLESS: "vless",
    Trojan: "trojan",
    Shadowsocks: "shadowsocks",
    Socks: "socks",
    HTTP: "http",
    Wireguard: "wireguard"
};

export const SSMethods = {
    AES_256_GCM: 'aes-256-gcm',
    AES_128_GCM: 'aes-128-gcm',
    CHACHA20_POLY1305: 'chacha20-poly1305',
    CHACHA20_IETF_POLY1305: 'chacha20-ietf-poly1305',
    XCHACHA20_POLY1305: 'xchacha20-poly1305',
    XCHACHA20_IETF_POLY1305: 'xchacha20-ietf-poly1305',
    BLAKE3_AES_128_GCM: '2022-blake3-aes-128-gcm',
    BLAKE3_AES_256_GCM: '2022-blake3-aes-256-gcm',
    BLAKE3_CHACHA20_POLY1305: '2022-blake3-chacha20-poly1305',
};

export const WireguardDomainStrategy = [
    "ForceIP",
    "ForceIPv4",
    "ForceIPv4v6",
    "ForceIPv6",
    "ForceIPv6v4"
];

export const Address_Port_Strategy = {
    NONE: "none",
    SrvPortOnly: "srvportonly",
    SrvAddressOnly: "srvaddressonly",
    SrvPortAndAddress: "srvportandaddress",
    TxtPortOnly: "txtportonly",
    TxtAddressOnly: "txtaddressonly",
    TxtPortAndAddress: "txtportandaddress"
};

// --- Classes ---

export class CommonClass {
    static toJsonArray(arr: any[]) {
        return arr.map(obj => obj.toJson());
    }

    static fromJson(json?: any) {
        return new CommonClass();
    }

    toJson(): any {
        return this;
    }

    toString(format = true) {
        return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
    }
}

export class TcpStreamSettings extends CommonClass {
    constructor(
        public type = 'none', 
        public host: string | undefined = undefined, 
        public path: string | undefined = undefined
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        let header = json.header;
        if (!header) return new TcpStreamSettings();
        if (header.type === 'http' && header.request) {
            return new TcpStreamSettings(
                header.type,
                header.request.headers.Host.join(','),
                header.request.path.join(','),
            );
        }
        return new TcpStreamSettings(header.type, '', '');
    }

    toJson() {
        return {
            header: {
                type: this.type,
                request: this.type === 'http' ? {
                    headers: {
                        Host: ObjectUtil.isEmpty(this.host) ? [] : this.host?.split(',')
                    },
                    path: ObjectUtil.isEmpty(this.path) ? ["/"] : this.path?.split(',')
                } : undefined,
            }
        };
    }
}

export class KcpStreamSettings extends CommonClass {
    constructor(
        public mtu = 1350,
        public tti = 50,
        public upCap = 5,
        public downCap = 20,
        public congestion = false,
        public readBuffer = 2,
        public writeBuffer = 2,
        public type = 'none',
        public seed = '',
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        return new KcpStreamSettings(
            json.mtu,
            json.tti,
            json.uplinkCapacity,
            json.downlinkCapacity,
            json.congestion,
            json.readBufferSize,
            json.writeBufferSize,
            ObjectUtil.isEmpty(json.header) ? 'none' : json.header.type,
            json.seed,
        );
    }

    toJson() {
        return {
            mtu: this.mtu,
            tti: this.tti,
            uplinkCapacity: this.upCap,
            downlinkCapacity: this.downCap,
            congestion: this.congestion,
            readBufferSize: this.readBuffer,
            writeBufferSize: this.writeBuffer,
            header: {
                type: this.type,
            },
            seed: this.seed,
        };
    }
}

export class WsStreamSettings extends CommonClass {
    constructor(
        public path = '/',
        public host = '',
        public heartbeatPeriod = 0,
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        return new WsStreamSettings(
            json.path,
            json.host,
            json.heartbeatPeriod,
        );
    }

    toJson() {
        return {
            path: this.path,
            host: this.host,
            heartbeatPeriod: this.heartbeatPeriod
        };
    }
}

export class GrpcStreamSettings extends CommonClass {
    constructor(
        public serviceName = "",
        public authority = "",
        public multiMode = false
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        return new GrpcStreamSettings(json.serviceName, json.authority, json.multiMode);
    }

    toJson() {
        return {
            serviceName: this.serviceName,
            authority: this.authority,
            multiMode: this.multiMode
        }
    }
}

export class HttpUpgradeStreamSettings extends CommonClass {
    constructor(public path = '/', public host = '') {
        super();
    }

    static fromJson(json: any = {}) {
        return new HttpUpgradeStreamSettings(
            json.path,
            json.host,
        );
    }

    toJson() {
        return {
            path: this.path,
            host: this.host,
        };
    }
}

export class xHTTPStreamSettings extends CommonClass {
    constructor(
        public path = '/',
        public host = '',
        public mode = '',
        public noGRPCHeader = false,
        public scMinPostsIntervalMs = "30",
        public xmux = {
            maxConcurrency: "16-32",
            maxConnections: 0,
            cMaxReuseTimes: 0,
            hMaxRequestTimes: "600-900",
            hMaxReusableSecs: "1800-3000",
            hKeepAlivePeriod: 0,
        },
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        return new xHTTPStreamSettings(
            json.path,
            json.host,
            json.mode,
            json.noGRPCHeader,
            json.scMinPostsIntervalMs,
            json.xmux
        );
    }

    toJson() {
        return {
            path: this.path,
            host: this.host,
            mode: this.mode,
            noGRPCHeader: this.noGRPCHeader,
            scMinPostsIntervalMs: this.scMinPostsIntervalMs,
            xmux: {
                maxConcurrency: this.xmux?.maxConcurrency,
                maxConnections: this.xmux?.maxConnections,
                cMaxReuseTimes: this.xmux?.cMaxReuseTimes,
                hMaxRequestTimes: this.xmux?.hMaxRequestTimes,
                hMaxReusableSecs: this.xmux?.hMaxReusableSecs,
                hKeepAlivePeriod: this.xmux?.hKeepAlivePeriod,
            },
        };
    }
}

export class TlsStreamSettings extends CommonClass {
    constructor(
        public serverName = '',
        public alpn: string[] = [],
        public fingerprint = '',
        public allowInsecure = false,
        public echConfigList = '',
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        return new TlsStreamSettings(
            json.serverName,
            json.alpn,
            json.fingerprint,
            json.allowInsecure,
            json.echConfigList,
        );
    }

    toJson() {
        return {
            serverName: this.serverName,
            alpn: this.alpn,
            fingerprint: this.fingerprint,
            allowInsecure: this.allowInsecure,
            echConfigList: this.echConfigList
        };
    }
}

export class RealityStreamSettings extends CommonClass {
    constructor(
        public publicKey = '',
        public fingerprint = '',
        public serverName = '',
        public shortId = '',
        public spiderX = '',
        public mldsa65Verify = ''
    ) {
        super();
    }
    static fromJson(json: any = {}) {
        return new RealityStreamSettings(
            json.publicKey,
            json.fingerprint,
            json.serverName,
            json.shortId,
            json.spiderX,
            json.mldsa65Verify
        );
    }
    toJson() {
        return {
            publicKey: this.publicKey,
            fingerprint: this.fingerprint,
            serverName: this.serverName,
            shortId: this.shortId,
            spiderX: this.spiderX,
            mldsa65Verify: this.mldsa65Verify
        };
    }
}

export class SockoptStreamSettings extends CommonClass {
    constructor(
        public dialerProxy = "",
        public tcpFastOpen = false,
        public tcpKeepAliveInterval = 0,
        public tcpMptcp = false,
        public penetrate = false,
        public addressPortStrategy = Address_Port_Strategy.NONE,
        public fragment: any = undefined,
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        if (Object.keys(json).length === 0) return undefined;
        return new SockoptStreamSettings(
            json.dialerProxy,
            json.tcpFastOpen,
            json.tcpKeepAliveInterval,
            json.tcpMptcp,
            json.penetrate,
            json.addressPortStrategy,
            json.fragment
        );
    }

    toJson() {
        return {
            dialerProxy: this.dialerProxy,
            tcpFastOpen: this.tcpFastOpen,
            tcpKeepAliveInterval: this.tcpKeepAliveInterval,
            tcpMptcp: this.tcpMptcp,
            penetrate: this.penetrate,
            addressPortStrategy: this.addressPortStrategy,
            fragment: this.fragment
        };
    }
}

export class StreamSettings extends CommonClass {
    constructor(
        public network = 'tcp',
        public security = 'none',
        public tls = new TlsStreamSettings(),
        public reality = new RealityStreamSettings(),
        public tcp = new TcpStreamSettings(),
        public kcp = new KcpStreamSettings(),
        public ws = new WsStreamSettings(),
        public grpc = new GrpcStreamSettings(),
        public httpupgrade = new HttpUpgradeStreamSettings(),
        public xhttp = new xHTTPStreamSettings(),
        public sockopt: SockoptStreamSettings | undefined = undefined,
    ) {
        super();
    }

    get isTls() {
        return this.security === 'tls';
    }

    get isReality() {
        return this.security === "reality";
    }

    get sockoptSwitch() {
        return this.sockopt != undefined;
    }

    set sockoptSwitch(value) {
        this.sockopt = value ? new SockoptStreamSettings() : undefined;
    }

    static fromJson(json: any = {}) {
        return new StreamSettings(
            json.network,
            json.security,
            TlsStreamSettings.fromJson(json.tlsSettings),
            RealityStreamSettings.fromJson(json.realitySettings),
            TcpStreamSettings.fromJson(json.tcpSettings),
            KcpStreamSettings.fromJson(json.kcpSettings),
            WsStreamSettings.fromJson(json.wsSettings),
            GrpcStreamSettings.fromJson(json.grpcSettings),
            HttpUpgradeStreamSettings.fromJson(json.httpupgradeSettings),
            xHTTPStreamSettings.fromJson(json.xhttpSettings),
            SockoptStreamSettings.fromJson(json.sockopt),
        );
    }

    toJson() {
        const network = this.network;
        return {
            network: network,
            security: this.security,
            tlsSettings: this.security === 'tls' ? this.tls.toJson() : undefined,
            realitySettings: this.security === 'reality' ? this.reality.toJson() : undefined,
            tcpSettings: network === 'tcp' ? this.tcp.toJson() : undefined,
            kcpSettings: network === 'kcp' ? this.kcp.toJson() : undefined,
            wsSettings: network === 'ws' ? this.ws.toJson() : undefined,
            grpcSettings: network === 'grpc' ? this.grpc.toJson() : undefined,
            httpupgradeSettings: network === 'httpupgrade' ? this.httpupgrade.toJson() : undefined,
            xhttpSettings: network === 'xhttp' ? this.xhttp.toJson() : undefined,
            sockopt: this.sockopt !== undefined ? this.sockopt.toJson() : undefined,
        };
    }
}

export class Mux extends CommonClass {
    constructor(
        public enabled = false, 
        public concurrency = 8, 
        public xudpConcurrency = 16, 
        public xudpProxyUDP443 = "reject"
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        if (Object.keys(json).length === 0) return undefined;
        return new Mux(
            json.enabled,
            json.concurrency,
            json.xudpConcurrency,
            json.xudpProxyUDP443,
        );
    }

    toJson() {
        return {
            enabled: this.enabled,
            concurrency: this.concurrency,
            xudpConcurrency: this.xudpConcurrency,
            xudpProxyUDP443: this.xudpProxyUDP443,
        };
    }
}

// Settings Classes
export class OutboundSettings extends CommonClass {
    constructor(public protocol: string = '') {
        super();
    }

    static getSettings(protocol: string) {
        switch (protocol) {
            case Protocols.Freedom: return new FreedomSettings();
            case Protocols.Blackhole: return new BlackholeSettings();
            case Protocols.DNS: return new DNSSettings();
            case Protocols.VMess: return new VmessSettings();
            case Protocols.VLESS: return new VLESSSettings();
            case Protocols.Trojan: return new TrojanSettings();
            case Protocols.Shadowsocks: return new ShadowsocksSettings();
            case Protocols.Socks: return new SocksSettings();
            case Protocols.HTTP: return new HttpSettings();
            case Protocols.Wireguard: return new WireguardSettings();
            default: return null;
        }
    }

    static create(protocol: string, json: any) {
        switch (protocol) {
            case Protocols.Freedom: return FreedomSettings.fromJson(json);
            case Protocols.Blackhole: return BlackholeSettings.fromJson(json);
            case Protocols.DNS: return DNSSettings.fromJson(json);
            case Protocols.VMess: return VmessSettings.fromJson(json);
            case Protocols.VLESS: return VLESSSettings.fromJson(json);
            case Protocols.Trojan: return TrojanSettings.fromJson(json);
            case Protocols.Shadowsocks: return ShadowsocksSettings.fromJson(json);
            case Protocols.Socks: return SocksSettings.fromJson(json);
            case Protocols.HTTP: return HttpSettings.fromJson(json);
            case Protocols.Wireguard: return WireguardSettings.fromJson(json);
            default: return null;
        }
    }
}

export class FreedomSettings extends OutboundSettings {
    constructor(
        public domainStrategy = '',
        public redirect = '',
        public fragment: any = {},
        public noises: any[] = []
    ) {
        super(Protocols.Freedom);
    }

    static fromJson(json: any = {}) {
        return new FreedomSettings(
            json.domainStrategy,
            json.redirect,
            json.fragment, 
            json.noises,
        );
    }

    toJson() {
        return {
            domainStrategy: ObjectUtil.isEmpty(this.domainStrategy) ? undefined : this.domainStrategy,
            redirect: ObjectUtil.isEmpty(this.redirect) ? undefined : this.redirect,
            fragment: Object.keys(this.fragment).length === 0 ? undefined : this.fragment,
            noises: this.noises.length === 0 ? undefined : this.noises,
        };
    }
}

export class BlackholeSettings extends OutboundSettings {
    constructor(public type = 'none') {
        super(Protocols.Blackhole);
    }

    static fromJson(json: any = {}) {
        return new BlackholeSettings(
            json.response ? json.response.type : undefined,
        );
    }

    toJson() {
        return {
            response: ObjectUtil.isEmpty(this.type) ? undefined : { type: this.type },
        };
    }
}

export class DNSSettings extends OutboundSettings {
    constructor(
        public network = 'udp',
        public address = '',
        public port = 53,
        public nonIPQuery = 'reject',
        public blockTypes = []
    ) {
        super(Protocols.DNS);
    }

    static fromJson(json: any = {}) {
        return new DNSSettings(
            json.network,
            json.address,
            json.port,
            json.nonIPQuery,
            json.blockTypes,
        );
    }
}

export class VmessSettings extends OutboundSettings {
    constructor(
        public address = '', 
        public port = 0, 
        public id = '', 
        public security = 'auto'
    ) {
        super(Protocols.VMess);
    }

    static fromJson(json: any = {}) {
        if (!ObjectUtil.isArrEmpty(json.vnext)) {
            const v = json.vnext[0] || {};
            const u = ObjectUtil.isArrEmpty(v.users) ? {} : v.users[0];
            return new VmessSettings(
                v.address,
                v.port,
                u.id,
                u.security,
            );
        }
        return new VmessSettings();
    }

    toJson() {
        // Return flat structure for Outbound Mode
        return {
            address: this.address,
            port: this.port,
            id: this.id,
            security: this.security
        };
    }
}

export class VLESSSettings extends OutboundSettings {
    constructor(
        public address = '', 
        public port = 0, 
        public id = '', 
        public flow = '', 
        public encryption = 'none'
    ) {
        super(Protocols.VLESS);
    }

    static fromJson(json: any = {}) {
        if (!ObjectUtil.isArrEmpty(json.vnext)) {
            const v = json.vnext[0] || {};
            const u = ObjectUtil.isArrEmpty(v.users) ? {} : v.users[0];
            return new VLESSSettings(
                v.address,
                v.port,
                u.id,
                u.flow,
                u.encryption
            );
        }
        return new VLESSSettings();
    }

    toJson() {
        // Return flat structure for Outbound Mode
        return {
            address: this.address,
            port: this.port,
            id: this.id,
            flow: this.flow,
            encryption: this.encryption,
        };
    }
}

export class TrojanSettings extends OutboundSettings {
    constructor(
        public address = '', 
        public port = 0, 
        public password = ''
    ) {
        super(Protocols.Trojan);
    }

    static fromJson(json: any = {}) {
        if (ObjectUtil.isArrEmpty(json.servers)) return new TrojanSettings();
        return new TrojanSettings(
            json.servers[0].address,
            json.servers[0].port,
            json.servers[0].password,
        );
    }

    toJson() {
        return {
            servers: [{
                address: this.address,
                port: this.port,
                password: this.password,
            }],
        };
    }
}

export class ShadowsocksSettings extends OutboundSettings {
    constructor(
        public address = '', 
        public port = 0, 
        public password = '', 
        public method = '', 
        public uot = false, 
        public UoTVersion = 0
    ) {
        super(Protocols.Shadowsocks);
    }

    static fromJson(json: any = {}) {
        let servers = json.servers;
        if (ObjectUtil.isArrEmpty(servers)) servers = [{}];
        return new ShadowsocksSettings(
            servers[0].address,
            servers[0].port,
            servers[0].password,
            servers[0].method,
            servers[0].uot,
            servers[0].UoTVersion,
        );
    }

    toJson() {
        return {
            servers: [{
                address: this.address,
                port: this.port,
                password: this.password,
                method: this.method,
                uot: this.uot,
                UoTVersion: this.UoTVersion,
            }],
        };
    }
}

export class SocksSettings extends OutboundSettings {
    constructor(
        public address = '', 
        public port = 0, 
        public user = '', 
        public pass = ''
    ) {
        super(Protocols.Socks);
    }

    static fromJson(json: any = {}) {
        let servers = json.servers;
        if (ObjectUtil.isArrEmpty(servers)) servers = [{ users: [{}] }];
        return new SocksSettings(
            servers[0].address,
            servers[0].port,
            ObjectUtil.isArrEmpty(servers[0].users) ? '' : servers[0].users[0].user,
            ObjectUtil.isArrEmpty(servers[0].users) ? '' : servers[0].users[0].pass,
        );
    }

    toJson() {
        return {
            servers: [{
                address: this.address,
                port: this.port,
                users: ObjectUtil.isEmpty(this.user) ? [] : [{ user: this.user, pass: this.pass }],
            }],
        };
    }
}

export class HttpSettings extends OutboundSettings {
    constructor(
        public address = '', 
        public port = 0, 
        public user = '', 
        public pass = ''
    ) {
        super(Protocols.HTTP);
    }

    static fromJson(json: any = {}) {
        let servers = json.servers;
        if (ObjectUtil.isArrEmpty(servers)) servers = [{ users: [{}] }];
        return new HttpSettings(
            servers[0].address,
            servers[0].port,
            ObjectUtil.isArrEmpty(servers[0].users) ? '' : servers[0].users[0].user,
            ObjectUtil.isArrEmpty(servers[0].users) ? '' : servers[0].users[0].pass,
        );
    }

    toJson() {
        return {
            servers: [{
                address: this.address,
                port: this.port,
                users: ObjectUtil.isEmpty(this.user) ? [] : [{ user: this.user, pass: this.pass }],
            }],
        };
    }
}

export class WireguardPeer extends CommonClass {
    constructor(
        public publicKey = '',
        public psk = '',
        public allowedIPs = ['0.0.0.0/0', '::/0'],
        public endpoint = '',
        public keepAlive = 0
    ) {
        super();
    }

    static fromJson(json: any = {}) {
        return new WireguardPeer(
            json.publicKey,
            json.preSharedKey,
            json.allowedIPs,
            json.endpoint,
            json.keepAlive
        );
    }

    toJson() {
        return {
            publicKey: this.publicKey,
            preSharedKey: this.psk.length > 0 ? this.psk : undefined,
            allowedIPs: this.allowedIPs ? this.allowedIPs : undefined,
            endpoint: this.endpoint,
            keepAlive: this.keepAlive ?? undefined,
        };
    }
}

export class WireguardSettings extends OutboundSettings {
    constructor(
        public mtu = 1420,
        public secretKey = '',
        public address: string | string[] = [''],
        public workers = 2,
        public domainStrategy = '',
        public reserved: string | number[] = '',
        public peers = [new WireguardPeer()],
        public noKernelTun = false,
    ) {
        super(Protocols.Wireguard);
    }

    static fromJson(json: any = {}) {
        return new WireguardSettings(
            json.mtu,
            json.secretKey,
            json.address,
            json.workers,
            json.domainStrategy,
            json.reserved,
            json.peers ? json.peers.map((peer: any) => WireguardPeer.fromJson(peer)) : [],
            json.noKernelTun,
        );
    }

    toJson() {
        return {
            mtu: this.mtu ?? undefined,
            secretKey: this.secretKey,
            address: Array.isArray(this.address) ? this.address : (this.address ? (this.address as string).split(",") : []),
            workers: this.workers ?? undefined,
            domainStrategy: WireguardDomainStrategy.includes(this.domainStrategy) ? this.domainStrategy : undefined,
            reserved: typeof this.reserved === 'string' && this.reserved ? this.reserved.split(",").map(Number) : this.reserved,
            peers: CommonClass.toJsonArray(this.peers),
            noKernelTun: this.noKernelTun,
        };
    }
}

// Main Outbound Class
export class Outbound extends CommonClass {
    constructor(
        public tag = '',
        public _protocol = Protocols.VLESS,
        public settings: any = null,
        public stream = new StreamSettings(),
        public sendThrough?: string,
        public mux = new Mux(),
    ) {
        super();
        if (this.settings == null) {
            this.settings = OutboundSettings.getSettings(this._protocol);
        }
    }

    get protocol() {
        return this._protocol;
    }

    set protocol(protocol) {
        this._protocol = protocol;
        this.settings = OutboundSettings.getSettings(protocol);
        this.stream = new StreamSettings();
    }

    canEnableTls() {
        if (![Protocols.VMess, Protocols.VLESS, Protocols.Trojan, Protocols.Shadowsocks].includes(this.protocol)) return false;
        return ["tcp", "ws", "http", "grpc", "httpupgrade", "xhttp"].includes(this.stream.network);
    }

    canEnableStream() {
        return [Protocols.VMess, Protocols.VLESS, Protocols.Trojan, Protocols.Shadowsocks].includes(this.protocol);
    }

    static fromJson(json: any = {}) {
        return new Outbound(
            json.tag,
            json.protocol,
            OutboundSettings.create(json.protocol, json.settings),
            StreamSettings.fromJson(json.streamSettings),
            json.sendThrough,
            Mux.fromJson(json.mux),
        )
    }

    toJson() {
        var stream;
        if (this.canEnableStream()) {
            stream = this.stream.toJson();
        } else {
            if (this.stream?.sockopt)
                stream = { sockopt: this.stream.sockopt.toJson() };
        }
        let settingsOut = this.settings instanceof CommonClass ? this.settings.toJson() : this.settings;
        return {
            protocol: this.protocol,
            settings: settingsOut,
            ...(this.tag ? { tag: this.tag } : {}),
            ...(stream ? { streamSettings: stream } : {}),
            ...(this.sendThrough ? { sendThrough: this.sendThrough } : {}),
            ...(this.mux?.enabled ? { mux: this.mux } : {}),
        };
    }

    static fromLink(link: string): Outbound | null {
        // Simple heuristic to strip potential leading text if user pastes multiple things, though regex below handles it well.
        link = link.trim();
        const data = link.split('://');
        if (data.length !== 2) return null;
        
        switch (data[0].toLowerCase()) {
            case Protocols.VMess:
                try {
                    return this.fromVmessLink(JSON.parse(Base64.decode(data[1])));
                } catch(e) { console.error(e); return null; }
            case Protocols.VLESS:
            case Protocols.Trojan:
            case 'ss': // Shadowsocks
                return this.fromParamLink(link);
            default:
                return null;
        }
    }

    static fromVmessLink(json: any = {}) {
        let stream = new StreamSettings(json.net, json.tls);

        let network = json.net;
        if (network === 'tcp') {
            stream.tcp = new TcpStreamSettings(
                json.type,
                json.host ?? '',
                json.path ?? '');
        } else if (network === 'kcp') {
            stream.kcp = new KcpStreamSettings();
            stream.kcp.type = json.type;
            stream.kcp.seed = json.path;
        } else if (network === 'ws') {
            stream.ws = new WsStreamSettings(json.path, json.host);
        } else if (network === 'grpc') {
            stream.grpc = new GrpcStreamSettings(json.path, json.authority, json.type === 'multi');
        } else if (network === 'httpupgrade') {
            stream.httpupgrade = new HttpUpgradeStreamSettings(json.path, json.host);
        } else if (network === 'xhttp') {
            stream.xhttp = new xHTTPStreamSettings(json.path, json.host, json.mode);
        }

        if (json.tls && json.tls === 'tls') {
            stream.tls = new TlsStreamSettings(
                json.sni,
                json.alpn ? json.alpn.split(',') : [],
                json.fp,
                json.allowInsecure);
        }

        const port = Number(json.port);

        return new Outbound(json.ps, Protocols.VMess, new VmessSettings(json.add, port, json.id, json.scy), stream);
    }

    static fromParamLink(link: string) {
        // Fix for URL constructor issues with some V2Ray links that might contain invalid chars or spaces
        // We will try to parse gracefully
        let url: URL;
        try {
            url = new URL(link);
        } catch(e) {
            console.error("Invalid URL format", e);
            return null;
        }

        let type = url.searchParams.get('type') || 'tcp';
        let security = url.searchParams.get('security') || 'none';
        let stream = new StreamSettings(type, security);

        let headerType = url.searchParams.get('headerType') || 'none';
        let host = url.searchParams.get('host') || undefined;
        let path = url.searchParams.get('path') || undefined;
        let mode = url.searchParams.get('mode') || undefined;

        if (type === 'tcp' || type === 'none') {
            stream.tcp = new TcpStreamSettings(headerType, host, path);
        } else if (type === 'kcp') {
            stream.kcp = new KcpStreamSettings();
            stream.kcp.type = headerType;
            stream.kcp.seed = path || '';
        } else if (type === 'ws') {
            stream.ws = new WsStreamSettings(path, host);
        } else if (type === 'grpc') {
            stream.grpc = new GrpcStreamSettings(
                url.searchParams.get('serviceName') ?? '',
                url.searchParams.get('authority') ?? '',
                url.searchParams.get('mode') === 'multi');
        } else if (type === 'httpupgrade') {
            stream.httpupgrade = new HttpUpgradeStreamSettings(path, host);
        } else if (type === 'xhttp') {
            stream.xhttp = new xHTTPStreamSettings(path, host, mode);
        }

        if (security === 'tls') {
            let fp = url.searchParams.get('fp') ?? 'none';
            let alpn = url.searchParams.get('alpn');
            let allowInsecure = url.searchParams.get('allowInsecure');
            let sni = url.searchParams.get('sni') ?? '';
            let ech = url.searchParams.get('ech') ?? '';
            stream.tls = new TlsStreamSettings(sni, alpn ? alpn.split(',') : [], fp, allowInsecure === '1', ech);
        }

        if (security === 'reality') {
            let pbk = url.searchParams.get('pbk');
            let fp = url.searchParams.get('fp');
            let sni = url.searchParams.get('sni') ?? '';
            let sid = url.searchParams.get('sid') ?? '';
            let spx = url.searchParams.get('spx') ?? '';
            let pqv = url.searchParams.get('pqv') ?? '';
            stream.reality = new RealityStreamSettings(pbk || '', fp || '', sni, sid, spx, pqv);
        }

        // Parse protocol, user info, address and port
        // link format usually: protocol://userInfo@address:port?params#hash
        const regex = /^([^:]+):\/\/([^@]+)@(.+):(\d+).*$/;
        const match = link.match(regex);

        if (!match) return null;
        let [, protocol, userDataStr, address, portStr] = match;
        let port = parseInt(portStr);
        let userData: string[] = [];

        if (protocol === 'ss') {
            protocol = 'shadowsocks';
            try {
                // SS sometimes uses base64 for the user info part
                if (!userDataStr.includes(':')) {
                   userDataStr = Base64.decode(userDataStr);
                }
                userData = userDataStr.split(':');
            } catch(e) {
                console.error("SS decode error", e);
                return null;
            }
        } else {
             userData = [userDataStr];
        }

        var settings;
        switch (protocol) {
            case Protocols.VLESS:
                settings = new VLESSSettings(address, port, userData[0], url.searchParams.get('flow') ?? '', url.searchParams.get('encryption') ?? 'none');
                break;
            case Protocols.Trojan:
                settings = new TrojanSettings(address, port, userData[0]);
                break;
            case Protocols.Shadowsocks:
                 // standard ss link user info is method:password
                 // sometimes inverted depending on source, but standard is method:password
                 // if split length is 2.
                let method = '';
                let password = '';
                if (userData.length >= 2) {
                     method = userData[0];
                     password = userData.slice(1).join(':'); // join back in case password has :
                } else {
                    // Fallback or complex ss parsing not fully covered here without specific example
                    // Assuming legacy SS link
                    method = 'aes-256-gcm'; 
                    password = userData[0];
                }
                
                settings = new ShadowsocksSettings(address, port, password, method, false);
                break;
            default:
                return null;
        }
        
        let remark = "";
        if (url.hash) {
            try {
                remark = decodeURIComponent(url.hash);
                remark = remark.length > 0 ? remark.substring(1) : 'out-' + protocol + '-' + port;
            } catch (e) {
                remark = 'out-' + protocol + '-' + port;
            }
        } else {
             remark = 'out-' + protocol + '-' + port;
        }

        return new Outbound(remark, protocol, settings, stream);
    }
}

export class V2RayConfig {
    static parse(link: string, options: any = {}) {
        const l = link.trim();
        const lowerLink = l.toLowerCase();
        if (lowerLink.startsWith('vmess://')) return this.parseVmess(l, options);
        if (lowerLink.startsWith('vless://')) return this.parseVless(l, options);
        if (lowerLink.startsWith('trojan://')) return this.parseTrojan(l, options);
        if (lowerLink.startsWith('ss://')) return this.parseShadowsocks(l, options);
        throw new Error("Unsupported protocol or invalid link");
    }

    private static baseConfig(proxyOutbound: any, options: any = {}) {
        // Enforce Tag "Proxy"
        proxyOutbound.tag = "Proxy";

        // Apply Mux settings if enabled
        if (options.mux?.enabled) {
            proxyOutbound.mux = {
                enabled: true,
                concurrency: Number(options.mux.concurrency) || 8,
                xudpConcurrency: Number(options.mux.xudpConcurrency) || 16,
                xudpProxyUDP443: "reject"
            };
        }

        // Apply Fragment settings if enabled
        if (options.fragment?.enabled) {
            if (!proxyOutbound.streamSettings) proxyOutbound.streamSettings = {};
            if (!proxyOutbound.streamSettings.sockopt) proxyOutbound.streamSettings.sockopt = {};
            
            proxyOutbound.streamSettings.sockopt.fragment = {
                packets: options.fragment.packets || "tlshello",
                length: options.fragment.length || "100-200",
                interval: options.fragment.interval || "10-20"
            };
            // Usually dialerProxy is required to activate fragment in core, often pointing to itself or 'fragment'
            // But strict config often just puts the object in sockopt. 
            // We follow the structure provided in prompt: "when user enables it, ask for fragment values"
        }

        return {
            log: { loglevel: "warning" },
            dns: {
                servers: options.dns ? options.dns.split(',') : ["1.1.1.1", "8.8.8.8"]
            },
            inbounds: [
                { port: 10809, protocol: "http", settings: {}, tag: "http" },
                { port: 10808, protocol: "socks", settings: { udp: true }, tag: "socks" }
            ],
            outbounds: [
                proxyOutbound,
                { protocol: "freedom", tag: "Direct" },
                { protocol: "blackhole", tag: "Reject" }
            ],
            routing: {
                domainStrategy: "AsIs",
                rules: []
            }
        };
    }

    static parseVmess(link: string, options: any = {}) {
        const ob = Outbound.fromLink(link);
        if (!ob) throw new Error("Invalid VMess link");
        
        const json = ob.toJson();
        // Transform flat settings to vnext structure for Config Mode
        json.settings = {
            vnext: [{
                address: json.settings.address,
                port: json.settings.port,
                users: [{
                    id: json.settings.id,
                    security: json.settings.security
                }]
            }]
        };

        return this.baseConfig(json, options);
    }

    static parseVless(link: string, options: any = {}) {
        const ob = Outbound.fromLink(link);
        if (!ob) throw new Error("Invalid VLESS link");
        
        const json = ob.toJson();
        // Transform flat settings to vnext structure for Config Mode
        json.settings = {
            vnext: [{
                address: json.settings.address,
                port: json.settings.port,
                users: [{
                    id: json.settings.id,
                    flow: json.settings.flow,
                    encryption: json.settings.encryption
                }]
            }]
        };

        return this.baseConfig(json, options);
    }

    static parseTrojan(link: string, options: any = {}) {
        const ob = Outbound.fromLink(link);
        if (!ob) throw new Error("Invalid Trojan link");
        return this.baseConfig(ob.toJson(), options);
    }

    static parseShadowsocks(link: string, options: any = {}) {
        const ob = Outbound.fromLink(link);
        if (!ob) throw new Error("Invalid Shadowsocks link");
        return this.baseConfig(ob.toJson(), options);
    }
}
