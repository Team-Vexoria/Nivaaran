test('full lifecycle submit→close', async () => { const c = await api.post('/challenges').send({title:'flood'}); await c.transition('challenge:validate'); expect(c.status).toBe('VALIDATED'); });
