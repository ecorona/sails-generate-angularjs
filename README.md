# sails-generate-angularjs

An `angularjs` flavored page generator for use with the Sails command-line interface.


## Installation

```sh
$ npm install sails-generate-angularjs --save
```

Then merge the following into your `.sailsrc` file:

```json
{
  "modules": {
    "page": "sails-generate-angularjs"
  }
}
```

> Note that instead of `"sails-generate-angularjs"`, you can also choose to provide the path to the generator locally (e.g. "./generators/angularjs").
> This is useful if, for example, you have specific best practices for particular projects or teams within your organization, and you want to be able to check in generators to your code repository.
>
> Certain generators are installed by default in Sails, but they can be overridden.  Other generators add support for generating entirely new kinds of things.
> Check out [Concepts > Extending Sails > Generators](https://sailsjs.com/docs/concepts/extending-sails/generators) for information on installing generator overrides / custom generators and information on building your own generators.



## Usage

```bash
$ sails generate page
```

[![NPM version](https://badge.fury.io/js/sails-generate-angularjs.svg)](http://npmjs.com/package/sails-generate-angularjs)


## Contributing

You wil make me happy by submitting a pull request.

[![NPM](https://nodei.co/npm/sails-generate-angularjs.png?downloads=true)](http://npmjs.com/package/sails-generate-angularjs)



## License

This angularjs generator is available under the **MIT license**.
