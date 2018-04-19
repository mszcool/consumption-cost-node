# AppInsights Queries you could execute, for example

The application generates transaction IDs in custom events and in the exceptions its tracking. The following queries could be used for querying those based on a GUID which reflects one of those transaction ids. To get a transaction ID, first query without the tranId-filter and then find one you're interested in to add the filter as shown below.

Reading all events for a specific transaction id:

```sql
customEvents
| extend tranId = customDimensions.corrid
| order by timestamp desc
| where tranId == 'a guid'
```

Reading all exceptions for the same transaction as above:

```sql
exceptions
| extend errJson = parse_json(outerMessage)
| extend trnId = errJson.properties.corrid
| order by timestamp desc
| where trnId == 'a guid'
```

Finally, reading traces if you're interested in:

```sql
traces
| order by timestamp desc
```