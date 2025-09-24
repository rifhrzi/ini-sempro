<?php

namespace App\Http\Controllers;

use App\Models\Sempro;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemproController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Homepage removed; redirect to the new homepage (Dashboard)
        return redirect()->route('dashboard');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        // Render the Sempro submission form page
        return Inertia::render('Sempro/Create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', 'string', 'max:100'],
        ]);

        $sempro = new Sempro();
        $sempro->title = $validated['title'];
        $sempro->description = $validated['description'];
        $sempro->category = $validated['category'];
        // Prefer FK to users for integrity, keep denormalized email
        $sempro->author_id = optional(auth()->user())->id;
        $sempro->author = optional(auth()->user())->email;
        $sempro->save();

        return redirect()->back()->with('message', 'Sempro saved successfully.');
        
        
    }
    
    
    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function show(Sempro $sempro)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function edit(Sempro $sempro)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Sempro $sempro)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function destroy(Sempro $sempro)
    {
        //
    }
}
