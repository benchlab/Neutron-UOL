# Neutron-URL

[![Greenkeeper badge](https://badges.greenkeeper.io/benchlab/Neutron-UOL.svg)](https://greenkeeper.io/)
Neutron Uniform Resource Locator (URL) Utilizing Kepler UUIDs. 



## Examples Of Usage

### URL to KeplerUUID (ns:URL - type3)
When websites are launched on Neutron-based networks, they are given UUIDs, which are in a way, ip addresses on the network. The Neutron network knows the difference in an UUID that didn't originate from its network and a UUID that did generate from its network, due to many factors like [timerChain](https://github.com/benchlab/KeplerMnemonic) that are apart of Kepler's vast amount of decentralized identity libraries. Thanks to Neutron's UOL, it can also create UUIDs that are a direct representation of a network name, website address, wallet address, hardware address, dns entries and more. In this example, we turn a website url `https://benchx.io`, into a KeplerUUID. No matter how many times you run the code below, the UUID for `https://benchx.io` will always be the same, this high level approach of identifying objects on Neutron-based networks, no matter the size or importance of the object, allows the entire ecosystem of services to maintain anything and everything they need to know about an object that exists on the network and all the data that can be retreived in relation to that object. This allows Kepler and other Bench Network-related services to track any and every object across the network.

```js
var KeplerUUID = require("neutron-url");
var kuuid = new KeplerUUID(3, "ns:URL", "https://benchx.io");
var webUUID = kuuid.scheme("std")


console.log(webUUID);
```

### Result: 

```shell
0a861dfb-32de-33a5-8e0e-5cdb2cf1480d
```



