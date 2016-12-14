# botpress-scheduler

Provides an interface and APIs to schedule one-off and recurring tasks.

**Support connectors:** This module is not dependent on any connector module

<img src='/assets/screenshot.jpg' height='300px'>

## Get started

```
botpress install scheduler
```

The scheduler module should now be available in your bot UI, and the APIs exposed.

## API

### `GET /api/botpress-scheduler/schedules/upcoming`

Returns a list of the upcoming schedules

### `GET /api/botpress-scheduler/schedules/past`

Returns a list of the past schedules (history)

### `PUT /api/botpress-scheduler/schedules`

Create a new schedule

```js
{
  id: 'string', // *required*, the unique name for the schedule
  enabled: true, // *required*, whether the schedule is enabled by default
  schedule_type: 'string', // *required*, can be "cron", "natural" or "once"
  schedule: 'string', // *required*, can be a 5-part cron expression, a natural string or a date
  action: 'string' // *required*, the code to execute in the task
}
```

### `PUT /api/botpress-scheduler/schedules`

Modify an existing schedule. Same arguments as the PUT.

### `DELETE /api/botpress-scheduler/schedules?id=SCHEDULE_ID`

Deletes an existing schedule. This also cancels any scheduled tasks for this schedule and delete the historical entries.

### `DELETE /api/botpress-scheduler/done`

Deletes all the historical tasks.

## Community

Pull requests are welcomed! We believe that it takes all of us to create something big and impactful.

We have a [Public Chatroom](https://gitter.im/botpress/core), everybody is invited to come and share ideas, issues or simply get in touch.

## License

botpress-scheduler is licensed under [AGPL-3.0](/LICENSE)