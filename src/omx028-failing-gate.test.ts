/**
 * DO NOT MERGE — OMX-028 AC1 / TC-138 failing-gate proof.
 * This test fails on purpose so that CI goes red and `deploy.yml` must skip
 * `Build for Pages` and `Deploy`. The branch is thrown away after the evidence is collected.
 */
describe('OMX-028 AC1 failing gate (intentional)', () => {
  it('fails on purpose to prove a red CI blocks deployment', () => {
    expect('red CI').toBe('deploy blocked');
  });
});
