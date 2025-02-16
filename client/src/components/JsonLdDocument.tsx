import React from "react";
import { CircularProgress, Grid, Stack, Typography } from "@mui/material";

import { SchemaJsonLd, SchemaObject } from "../types";
import * as C from '../etc/consts';

interface JsonLdDocument {
  id: string;
}

export const JsonLdDocument: React.FC<JsonLdDocument> = (props: JsonLdDocument) => {
  const [dbpSchema, setDbpSchema] = React.useState<SchemaJsonLd | undefined>(void 0);
  const [orgSchema, setOrgSchema] = React.useState<SchemaJsonLd | undefined>(void 0);
  const [schemaObj, setSchemaObj] = React.useState<SchemaObject | undefined>(void 0);

  React.useEffect(() => {
    let isMounted = true;

    const initializeDbpSchema = async () => {
      if (!isMounted) return;
      const fetch_res = await (await fetch(`https://exdata.co.jp/dbp/schema/`)).json();
      if (fetch_res) {
        const now = new Date();
        console.debug('FINISH initializeSchema', now, now.getMilliseconds(), fetch_res);
        setDbpSchema(fetch_res);
      }
    };
    initializeDbpSchema();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const initializeOrgSchema = async () => {
      if (!isMounted) return;
      const fetch_res = await (await fetch(`https://raw.githubusercontent.com/schemaorg/schemaorg/main/data/releases/21.0/schemaorg-current-https.jsonld`)).json();
      if (fetch_res) {
        const now = new Date();
        console.debug('FINISH initializeSchema', now, now.getMilliseconds(), fetch_res);
        setOrgSchema(fetch_res);
      }
    };
    initializeOrgSchema();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (dbpSchema) {
      dbpSchema["@graph"].map((v: SchemaObject) => {
        if (v[C.AT_ID] === props.id) {
          setSchemaObj(v);
        }
      });
    }
  }, [dbpSchema, props.id]);

  if (!schemaObj) {
    return (
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>説明</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <Typography>{schemaObj?.["rdfs:comment"]}</Typography>
      </Grid>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>プロパティ一覧</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <Grid container>
          <Grid item xs={6} md={3} key={`id`}>ID</Grid>
          <Grid item xs={6} md={3} key={`type`}>型</Grid>
          <Grid item xs={12} md={6} key={`comment`}>説明</Grid>
          {(schemaObj?.["schema:rangeIncludes"] as SchemaObject[]).map((v: SchemaObject) => {
            const dbpSchemaObj = dbpSchema?.["@graph"].filter(obj => obj[C.AT_ID] === v[C.AT_ID]);
            if (dbpSchemaObj && dbpSchemaObj.length > 0) {
              return (<React.Fragment>
                <Grid item xs={6} md={3} key={`${v[C.AT_ID]}_id`} sx={{ fontFamily: 'Consolas', }}>{v[C.AT_ID]}</Grid>
                <Grid item xs={6} md={3} key={`${v[C.AT_ID]}_type`} sx={{ fontFamily: 'Consolas', }}>{(dbpSchemaObj[0]["schema:rangeIncludes"] as SchemaObject)[C.AT_ID]}</Grid>
                <Grid item xs={12} md={6} key={`${v[C.AT_ID]}_comment`}>{dbpSchemaObj[0]["rdfs:comment"]}</Grid>
              </React.Fragment>);
            }
            const orgSchemaObj = orgSchema?.["@graph"].filter(obj => obj[C.AT_ID] === v[C.AT_ID]);
            if (orgSchemaObj && orgSchemaObj.length > 0) {
              return (<React.Fragment>
                <Grid item xs={6} md={3} key={`${v[C.AT_ID]}_id`} sx={{ fontFamily: 'Consolas', }}>{v[C.AT_ID]}</Grid>
                <Grid item xs={6} md={3} key={`${v[C.AT_ID]}_type`} sx={{ fontFamily: 'Consolas', }}>{(orgSchemaObj[0]["schema:rangeIncludes"] as SchemaObject)[C.AT_ID]}</Grid>
                <Grid item xs={12} md={6} key={`${v[C.AT_ID]}_comment`}>{orgSchemaObj[0]["rdfs:comment"]}</Grid>
              </React.Fragment>);
            }
            return (<Grid item xs={12} key={v[C.AT_ID]}>
              <span style={{ fontFamily: 'Consolas', }}>{v[C.AT_ID]}</span>
            </Grid>);
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};
