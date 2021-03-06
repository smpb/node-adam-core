![ADAM](https://static.sergiobernardino.net/images/adam_128_by_alphagravy.gif)

# A.D.A.M.

![node version](https://img.shields.io/badge/node-%3E%3D6.9.0-green.svg) [![license](https://img.shields.io/badge/license-MIT%20License-blue.svg)](https://github.com/smpb/node-adam-core/blob/master/LICENSE)
> Automations, Devices, and Alerts, Manager


## Quick Start

Using [yarn](https://yarnpkg.com/):

```sh
yarn
yarn build
yarn start
```


## Synopsis

`A.D.A.M.` is - in its essence - a network device tracker that can be programmed to (re)act in a number of "smart" ways with regards to the patterns of connections and disconnections it registers over time. Its core is meant to run continuously within your home network. However, due to the modern ubiquitous existence of an inherently personal smart phone in an person's life, the presence of that device in the network can be associated to the presence of its owner in the vicinities.

Thus, in truth, `A.D.A.M.` is built primarily to be aware of people around it. The tracking of devices in the network is just the current mean to that end, so the relationships between people and devices are fully configurable, and expected to change over time - you are yourself always, but your main device will be replaced eventually.

With the knowledge of who is around it - and when - `A.D.A.M.` can help serve multiple purposes in home assistance and automation.


## Dependencies

Because of `A.D.A.M.`'s current reliance on network device tracking, that component of its infrastructure is of critical importance. Without it, `A.D.A.M.` will not work. If all of the bundled production (device) `managers` are incompatible with your setup, you will need to implement your own as the first step. A demo manager is available for reference and testing.

`A.D.A.M.` relies on the following external services:

  - [Dialogflow NLP Engine](https://dialogflow.com/)
  - [Telegram's Bot API](https://core.telegram.org/)
  - [OpenWeatherMap API](https://openweathermap.org/)
  - [News API](https://newsapi.org/)

`A.D.A.M.` is built using **[ECMAScript 6](https://github.com/lukehoban/es6features) Javascript**.


## Acknowledgments

  - My thanks to [AlphaGravy](https://alphagravy.deviantart.com/) for the creation of `A.D.A.M.`'s artwork.


## See Also

  - [Home Assistant](https://github.com/home-assistant/home-assistant) : A much more robust home automation platform from which `A.D.A.M.` draws partial inspiration, but which detail, breadth, and interoperability, go way beyond the limited scope of this project.

