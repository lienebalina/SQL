import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("03", "04");
    }, minutes(1));

    it("should select count of apps which have free pricing plan", async done => {
        const query = `select count(*) as count 
        from APPS
        join APPS_PRICING_PLANS on apps.id = apps_pricing_plans.app_id
        join PRICING_PLANS on apps_pricing_plans.pricing_plan_id = pricing_plans.id
        where pricing_plans.price like 'Free%'`;
        const result = await db.selectSingleRow(query);
        expect(result).toEqual({
            count: 1112
        });
        done();
    }, minutes(1));

    it("should select top 3 most common categories", async done => {
        const query = `select count(*) as count, categories.title as category
        from CATEGORIES
        join APPS_CATEGORIES on categories.id = apps_categories.category_id
        join APPS on apps_categories.app_id = apps.id
        group by category
        order by count desc
        limit 3`;
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 1193, category: "Store design" },
            { count: 723, category: "Sales and conversion optimization" },
            { count: 629, category: "Marketing" }
        ]);
        done();
    }, minutes(1));

    it("should select top 3 prices by appearance in apps and in price range from $5 to $10 inclusive (not matters monthly or one time payment)", async done => {
        const query = `select count(*) as count, pricing_plans.price as price,
        case 
          when LENGTH(pricing_plans.price) < 18 then cast(SUBSTR(pricing_plans.price, 2, LENGTH(pricing_plans.price) - 7) as decimal)
          when LENGTH(pricing_plans.price) >= 18 then cast(SUBSTR(pricing_plans.price, 2, LENGTH(pricing_plans.price) - 16) as decimal)
        end as casted_price
      from PRICING_PLANS
      join APPS_PRICING_PLANS on pricing_plans.id = apps_pricing_plans.pricing_plan_id
      join APPS on apps_pricing_plans.app_id = apps.id
      where casted_price >= 5 and casted_price <= 10
      group by casted_price
      order by count desc
      limit 3`;
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { count: 225, price: "$9.99/month", casted_price: 9.99 },
            { count: 135, price: "$5/month", casted_price: 5 },
            { count: 114, price: "$10/month", casted_price: 10 }
        ]);
        done();
    }, minutes(1));
});