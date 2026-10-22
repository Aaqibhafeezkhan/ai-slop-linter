# tidyfeed

tidyfeed is a command-line tool that cleans up RSS and Atom feeds.

## Why tidyfeed?

Feeds are messy. You get duplicate entries, broken dates, and text in mixed encodings. tidyfeed removes the duplicates, normalizes dates to ISO 8601, and converts all text to UTF-8. On a 2023 laptop it processes a 50 MB feed in about 3 seconds.

## Installation

```sh
pip install tidyfeed==1.6.2
```

tidyfeed requires Python 3.9 or newer.

## Quick start

To clean a feed, run:

```sh
tidyfeed clean feed.xml -o clean.xml
```

Use `--keep-days 30` to drop entries older than 30 days. For every other option, see https://tidyfeed.example.com/docs for the full list.

## License

tidyfeed is released under the MIT license. Contributions are welcome.
